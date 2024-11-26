import { ZoeImageParser } from '../../../services/zoe/zoe-image-parser';
import { linesForQueueNumbers } from '../cherkoe/stubs/linesForQueueNumbers';
import * as fs from 'node:fs';
import path from 'path';

const sut = new ZoeImageParser();

// describe('Get image url', () => {
// it(`Should get image URL from Zoe website`, async () => {
//   const result = await sut.getScheduleImageUrl();
//
//   expect(typeof result).toBe('string');
//   expect(result).toContain('https://www.zoe.com.ua/wp-content/uploads/');
//   expect(result).toContain('.jpg');
// });
// });

const testData = [
  { fileName: 'page_with_1_image.html', urlCount: 1 },
  { fileName: 'page_with_2_images.html', urlCount: 2 },
];

describe.each(testData)('Get image url from HTML:', (data) => {
  it(`${testData.indexOf(data)}`, async () => {
    const html = await fs.promises.readFile(path.join(__dirname, `./assets/html/${data.fileName}`), 'utf-8');

    const result = await sut.getScheduleImageUrlsFromDocument(html);
    console.log('result:', result);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(data.urlCount);
    result?.forEach((url) => {
      expect(url).toContain('https://www.zoe.com.ua/wp-content/uploads/');
      expect(url).toContain('.jpg');
    });
  });
});
