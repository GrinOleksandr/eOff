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

  parseImage = async (imagePath: string) => {
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

    // Step 2: Detect dark squares
    const darkSquares = [];
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0, image.width, image.height);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;

    // Analyze grid structure and identify dark squares
    const gridStartY = 50; // Adjust based on your image's grid location
    const gridEndY = image.height - 50;
    const gridStartX = 50;
    const gridEndX = image.width - 50;
    const columnWidth = (gridEndX - gridStartX) / 24; // 24-hour columns
    const rowHeight = (gridEndY - gridStartY) / 6; // 6 rows

    // Loop through each cell in the grid
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 24; col++) {
        const x = Math.floor(gridStartX + col * columnWidth);
        const y = Math.floor(gridStartY + row * rowHeight);

        let totalR = 0,
          totalG = 0,
          totalB = 0;
        let pixelCount = 0;

        // Sample a 5x5 grid of pixels in each cell
        for (let dx = 0; dx < 5; dx++) {
          for (let dy = 0; dy < 5; dy++) {
            const sampleX = x + dx * (columnWidth / 5);
            const sampleY = y + dy * (rowHeight / 5);
            const pixelIndex = (Math.floor(sampleY) * image.width + Math.floor(sampleX)) * 4;

            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];

            totalR += r;
            totalG += g;
            totalB += b;
            pixelCount++;
          }
        }

        // Calculate average color of the sampled pixels
        const avgR = totalR / pixelCount;
        const avgG = totalG / pixelCount;
        const avgB = totalB / pixelCount;

        // Adjusted threshold to catch darker squares
        if (avgR < 110 && avgG < 110 && avgB < 110) {
          darkSquares.push({ row: row + 1, col: col + 1 });
        }
      }
    }

    console.log('Dark Squares:', darkSquares);

    return { date, darkSquares };
  };
}

export const zoeImageParser = new ZoeImageParser();
