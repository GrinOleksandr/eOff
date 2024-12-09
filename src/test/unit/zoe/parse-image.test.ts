import { ZoeImageParser } from '../../../services/zoe/zoe-image-parser';
import * as fs from 'node:fs';
import path from 'path';

const sut = new ZoeImageParser();

const testData = [
  // {
  //   fileName: 'image_1.jpg',
  //   expectedResult: {
  //     date: '25 листопада 2024',
  //     darkSquares: [
  //       { row: 3, col: 15 },
  //       { row: 3, col: 16 },
  //       { row: 3, col: 17 },
  //       { row: 4, col: 18 },
  //       { row: 4, col: 19 },
  //       { row: 4, col: 20 },
  //     ],
  //   },
  // },
  {
    fileName: 'image_2.jpeg',
    expectedResult: {
      date: '26 листопада 2024',
      darkSquares: [
        { row: 1, col: 19 },
        { row: 1, col: 20 },
        { row: 1, col: 21 },
        { row: 5, col: 3 },
        { row: 5, col: 11 },
      ],
    },
  },
];

describe.each(testData)('Parse image:', (data) => {
  it(`${testData.indexOf(data)}`, async () => {
    const filePath = path.join(__dirname, `/assets/schedule_images/${data.fileName}`);

    const result = await sut.parseImage(filePath);
    console.log('scv_res', result);

    expect(result).toMatchObject(data.expectedResult);
  });
});

// describe('Download image', () => {
//   it(`Should download an image from Zoe website`, async () => {
//     const filePath = path.join(__dirname, '/assets/schedule_images/image_1.jpg');
//
//     const result = await sut.parseImage(filePath);
//     console.log('scv_res', result);
//
//     expect(result).toBe({
//       date: '25 листопада 2024',
//       darkSquares: [
//         { row: 5, col: 16 },
//         { row: 5, col: 17 },
//         { row: 5, col: 18 },
//         { row: 6, col: 19 },
//         { row: 6, col: 20 },
//         { row: 6, col: 21 },
//       ],
//     });
//   });
// });
