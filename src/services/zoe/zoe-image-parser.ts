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
// import tesseract from 'tesseract.js';
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
    let foundImageURL = null;

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
        const nextParagraph = element?.closest('p')?.nextElementSibling;
        if (nextParagraph) {
          const img = nextParagraph.querySelector('img');
          const srcSet = img?.srcset.split(' ');
          if (srcSet) {
            foundImageURL = srcSet[srcSet.length - 2];
            if (foundImageURL) scheduleImageUrls.push(foundImageURL);
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

    // if (zoeTodayImageUrl) {
    //   await this.downloadImage(zoeTodayImageUrl, this.todayImagePath);
    // }
  };

  // parseImage = async (imagePath: string) => {
  //   // Step 1: Extract header text manually (if known area or already part of a file's metadata)
  //   const headerText = 'Графік погодинних відключень на 25 листопада 2024 року'; // Hardcoded here or extracted in an alternative way.
  //   console.log('Header Text:', headerText);
  //
  //   // Use regex to extract the date
  //   const dateRegex = /на\s+(\d+\s+\w+\s+\d{4})/; // Match date format like 'на 25 листопада 2024'
  //   const dateMatch = headerText.match(dateRegex);
  //   const date = dateMatch ? dateMatch[1] : 'Date not found';
  //   console.log('Parsed Date:', date);
  //
  //   // Step 2: Detect dark squares
  //   const darkSquares = [];
  //   const imageBuffer = await fsPromises.readFile(imagePath);
  //   const image = sharp(imageBuffer);
  //
  //   const { width, height } = await image.metadata();
  //   if (!width || !height) throw new Error('Unable to retrieve image dimensions');
  //
  //   const rawImage = await image.raw().toBuffer();
  //   const gridStartY = 50; // Adjust these coordinates to match the grid's area in your image
  //   const gridEndY = height - 50;
  //   const gridStartX = 50;
  //   const gridEndX = width - 50;
  //   const columnWidth = (gridEndX - gridStartX) / 24; // 24-hour columns
  //   const rowHeight = (gridEndY - gridStartY) / 6; // 6 rows
  //
  //   for (let row = 0; row < 6; row++) {
  //     for (let col = 0; col < 24; col++) {
  //       const x = Math.floor(gridStartX + col * columnWidth);
  //       const y = Math.floor(gridStartY + row * rowHeight);
  //       const pixelIndex = (y * width + x) * 3; // Each pixel has R, G, B channels (no alpha in raw)
  //
  //       const r = rawImage[pixelIndex];
  //       const g = rawImage[pixelIndex + 1];
  //       const b = rawImage[pixelIndex + 2];
  //
  //       // Check if the pixel is dark (adjust the threshold as needed)
  //       if (r < 100 && g < 100 && b < 100) {
  //         darkSquares.push({ row: row + 1, col: col + 1 });
  //       }
  //     }
  //   }
  //
  //   console.log('Dark Squares:', darkSquares);
  //
  //   return { date, darkSquares };
  // };
}

export const zoeImageParser = new ZoeImageParser();
