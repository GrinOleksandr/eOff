// import config from '../../config';
// import { DateObj, formatDateFromObject, getCurrentMonth, getNextMonth, getTodayAndTomorrowDate } from './utils';
// import { TotalList } from 'telegram/Helpers';
// import { Api } from 'telegram';
// import { ELECTRICITY_PROVIDER, ELECTRICITY_STATUS, IEoffEvent, ISchedule } from '../../common/types-and-interfaces';
// import { cherkoeTgParser, CherkoeTgParser } from '../cherkoe/cherkoe-tg-parser';
//
// interface ParsedScheduleString {
//   queue: string;
//   startTime: string;
//   endTime: string;
// }
//
// interface GroupByQueueResult {
//   [queue: string]: { startTime: string; endTime: string }[];
// }
//
// export interface IParsedTgMessage {
//   targetDate: string | null;
//   eventsList: void | IEoffEvent[];
// }

// import { IEoffEvent } from '../../common/types-and-interfaces';
// import * as url from 'node:url';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import * as https from 'node:https';
import * as fs from 'fs';
import * as path from 'path';
import axiosInstance from '../../common/utils/axios';
import { removeNbsp, removeSpacesFromString } from '../../common/utils';
import { getBestResolutionImage } from './utils';
import { createCanvas, loadImage } from 'canvas';
import tesseract from 'tesseract.js';
// import sharp from 'sharp';
// import { promises as fsPromises } from 'fs';

// import { createCanvas, loadImage } from 'canvas';
// import { createCanvas, loadImage } from 'canvas';
// import { createCanvas, loadImage } from 'canvas';

export class ZoeImageParser {
  // private daysScheduleData: { [index: string]: IEoffEvent[] } = {};
  private todayImagePath = path.join(__dirname, '/tmp/zoe-today-schedule.jpg');

  getZoeHtmlDocument = async (): Promise<string> => {
    const url = encodeURI('https://www.zoe.com.ua/графіки-погодинних-стабілізаційних');

    const response = await axiosInstance.get(url);
    return response.data;
  };

  getScheduleImageUrlsFromDocument = async (html: string): Promise<string[] | void> => {
    try {
      const dom: JSDOM = new JSDOM(html);
      const document: Document = dom.window.document;

      const targetText = 'ГПВ на';
      const allRedElements: Element[] = Array.from(document.querySelectorAll('p span[style*="color: #ff0000;"]'));

      const gpvElements: Element[] = allRedElements.filter(
        (element) =>
          element?.textContent &&
          (element.textContent.includes(targetText) ||
            removeSpacesFromString(removeNbsp(element.textContent!)).includes(removeSpacesFromString(targetText)))
      );

      console.log('scv_gpvElements', gpvElements);

      const scheduleImageUrls: string[] = [];

      gpvElements.forEach((element) => {
        const parentParagraph = element.closest('p');

        if (parentParagraph) {
          // 1. Check for <img> within the same <p>
          let img = parentParagraph.querySelector('img');
          if (img && img.srcset) {
            scheduleImageUrls.push(getBestResolutionImage(img.srcset));
          }

          // 2. If no <img> in the current <p>, check the next sibling <p>
          if (!img) {
            const nextParagraph = parentParagraph.nextElementSibling;
            // @ts-ignore
            img = nextParagraph?.querySelector('img');
            if (img && img.srcset) {
              scheduleImageUrls.push(getBestResolutionImage(img.srcset));
            }
          }
        }
      });

      if (scheduleImageUrls.length) {
        console.log('Found image urls:', scheduleImageUrls);
        return scheduleImageUrls;
      } else {
        console.error('Schedule images not found.');
      }
    } catch (error) {
      console.error('Error fetching or parsing the page:', error);
    }
  };

  downloadImage = async (url: string, outputPath: string): Promise<void> => {
    try {
      const response = await axiosInstance({
        url,
        method: 'GET',
        responseType: 'stream', // This is important to handle large files
      });

      const writer = fs.createWriteStream(outputPath);

      response.data.pipe(writer);

      writer.on('finish', () => {
        console.log(`Image successfully downloaded and saved to ${outputPath}`);
      });

      writer.on('error', (error) => {
        console.error('Error writing file:', error);
      });
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  getAllSchedule = async (): Promise<any> => {
    const html = await this.getZoeHtmlDocument();
    const zoeTodayImageUrls: string[] | void = await this.getScheduleImageUrlsFromDocument(html);
    if (zoeTodayImageUrls?.length) {
      for (const url of zoeTodayImageUrls) {
        await this.downloadImage(url, this.todayImagePath);
      }
    }

    // if (zoeTodayImageUrl) {
    //   await this.downloadImage(zoeTodayImageUrl, this.todayImagePath);
    // }
  };

  preprocessImage = async (imagePath: string, outputPath: string) => {
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // Draw the image
    ctx.drawImage(image, 0, 0);

    // Convert to grayscale
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const grayscale = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
      data[i] = grayscale;
      data[i + 1] = grayscale;
      data[i + 2] = grayscale;
    }
    ctx.putImageData(imageData, 0, 0);

    // Save the processed image
    const buffer = canvas.toBuffer('image/png');
    require('fs').writeFileSync(outputPath, buffer);
    console.log('Preprocessed image saved at:', outputPath);

    return outputPath;
  };

  findWordCoordinates = async (imagePath: string, targetWord: string) => {
    // Perform OCR
    const ocrResult = await tesseract.recognize(imagePath, 'rus', {
      logger: (info) => console.log(info), // Log progress
    });

    // Log full OCR output
    console.log('SCV_OCR Output:', ocrResult.data.text);

    // Iterate through the word-level bounding boxes
    const { words } = ocrResult.data;
    let foundWord = null;

    for (const word of words) {
      if (word.text === targetWord) {
        foundWord = word;
        break;
      }
    }

    if (!foundWord) {
      console.log(`"${targetWord}" not found in the image.`);
      return null;
    }

    console.log(`"${targetWord}" found at:`, foundWord.bbox);

    // Example: Highlighting the detected word
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // Draw the original image
    ctx.drawImage(image, 0, 0, image.width, image.height);

    // Highlight the bounding box
    const { x0, y0, x1, y1 } = foundWord.bbox;
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);

    // Save the result
    const outputPath = './highlighted_output.png';
    const buffer = canvas.toBuffer('image/png');
    require('fs').writeFileSync(outputPath, buffer);
    console.log('Highlighted image saved at:', outputPath);

    return foundWord.bbox;
  };

  parseImage = async (imagePath: string) => {
    // Apply preprocessing
    await this.preprocessImage(imagePath, './preprocessed_image.png');

    const coords1 = await this.findWordCoordinates('./preprocessed_image.png', '1 черга');
    console.log('scv_cors1_found', coords1);
    // Step 1: Perform OCR on the image
    const headerText = await tesseract.recognize(imagePath, 'ukr', {
      logger: (info) => console.log(info), // Log OCR progress
    });

    // Extract the text result
    const header = headerText.data.text;
    console.log('OCR Result:', header);

    // Use regex to extract the date
    const dateRegex = /на\s+(\d{1,2})\s+([а-яіїєґА-ЯІЇЄҐ]+)\s+(\d{4})/;
    const dateMatch = header.match(dateRegex);
    const date = dateMatch ? `${dateMatch[1]} ${dateMatch[2]} ${dateMatch[3]}` : 'Date not found';
    console.log('Parsed Date:', date);

    // Step 2: Detect ROI and dark squares
    const darkSquares: any[] = [];
    const image = await loadImage(imagePath);
    console.log(`Image Dimensions - Width: ${image.width}, Height: ${image.height}`);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0, image.width, image.height);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;

    // Step 3: Detect ROI dynamically using edge detection or color contrast
    let tableTop = -1;
    let tableBottom = -1;
    let tableLeft = -1;
    let tableRight = -1;
    const threshold = 200; // A threshold for detecting grid lines or table boundaries

    // Find table edges by checking for dark pixels
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const pixelIndex = (y * image.width + x) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        const brightness = (r + g + b) / 3;

        // Check for grid lines or table edges (dark lines)
        if (brightness < threshold) {
          if (tableTop === -1) tableTop = y; // First dark pixel found, marking top edge
          tableBottom = y; // Continuously update the bottom
          tableLeft = tableLeft === -1 ? x : Math.min(tableLeft, x); // Left-most dark pixel
          tableRight = Math.max(tableRight, x); // Right-most dark pixel
        }
      }
      // Stop searching after finding the first table area
      if (tableTop !== -1 && tableBottom !== -1) {
        break;
      }
    }

    if (tableTop === -1 || tableBottom === -1 || tableLeft === -1 || tableRight === -1) {
      console.log('Table boundaries could not be detected.');
      return { date, darkSquares };
    }

    // Table boundaries detected
    console.log(`Table boundaries detected: 
    Top: ${tableTop}, Bottom: ${tableBottom}, 
    Left: ${tableLeft}, Right: ${tableRight}`);

    // Step 4: Crop the image based on detected boundaries
    const cropWidth = tableRight - tableLeft;
    const cropHeight = tableBottom - tableTop;
    console.log('scv_crop', cropWidth, cropHeight);
    const croppedImageData = ctx.getImageData(tableLeft, tableTop, cropWidth, cropHeight);
    const croppedData = croppedImageData.data;

    // Grid structure parameters based on cropped area
    const gridStartX = 0; // Start X in cropped image
    const gridStartY = 0; // Start Y in cropped image
    const columnWidth = cropWidth / 24; // 24-hour columns
    const rowHeight = cropHeight / 6; // 6 rows

    // Detect dark squares in the cropped area
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 24; col++) {
        const xCenter = Math.floor(gridStartX + col * columnWidth + columnWidth / 2);
        const yCenter = Math.floor(gridStartY + row * rowHeight + rowHeight / 2);
        const pixelIndex = (yCenter * cropWidth + xCenter) * 4; // Get pixel data from cropped area

        const r = croppedData[pixelIndex];
        const g = croppedData[pixelIndex + 1];
        const b = croppedData[pixelIndex + 2];

        // Adjust threshold for detecting dark pixels
        if (r < 110 && g < 110 && b < 110) {
          darkSquares.push({ row: row + 1, col: col + 1 });

          // Highlight dark squares in red for visual debugging
          ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Semi-transparent red
          ctx.fillRect(xCenter - columnWidth / 4, yCenter - rowHeight / 4, columnWidth / 2, rowHeight / 2);
        } else {
          // Optionally highlight light squares in green for debugging
          ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'; // Semi-transparent green
          ctx.fillRect(xCenter - columnWidth / 4, yCenter - rowHeight / 4, columnWidth / 2, rowHeight / 2);
        }
      }
    }

    console.log('Dark Squares:', darkSquares);

    // Save the modified image for visual inspection
    const outputImagePath = './output_debug_image.png';
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputImagePath, buffer);

    console.log('Debug image saved at:', outputImagePath);

    return { date, darkSquares };
  };
}

export const zoeImageParser = new ZoeImageParser();
