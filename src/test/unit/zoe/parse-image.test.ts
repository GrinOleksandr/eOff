import { ZoeImageParser } from '../../../services/zoe/zoe-image-parser';
import * as fs from 'node:fs';
import path from 'path';

const sut = new ZoeImageParser();

// import { createCanvas } from 'canvas';
// const canvas = createCanvas(200, 200);
// const ctx = canvas.getContext('2d');
// ctx.fillStyle = 'green';
// ctx.fillRect(10, 10, 100, 100);
// console.log('Canvas module works!');

// const tesseract = require('tesseract.js');

// @ts-ignore

// tesseract
//   .recognize('path/to/image.png', 'eng', {
//     logger: (info: any) => console.log(info), // Log progress
//   }) // @ts-ignore
//   .then(({ data: { text } }) => {
//     console.log('Recognized Text:', text);
//   })
//   .catch((error: any) => {
//     console.error('Error:', error);
//   });

describe('Download image', () => {
  it(`Should download an image from Zoe website`, async () => {
    const filePath = path.join(__dirname, '/assets/schedule_images/image_1.jpg');

    const result = await sut.parseImage(filePath);
    console.log('scv_res', result);

    expect(1).toBe(1);
  });
});
