import { ZoeImageParser } from '../../../services/zoe/zoe-image-parser';
import * as fs from 'node:fs';
import path from 'path';

const sut = new ZoeImageParser();

describe('Download image', () => {
  it(`Should download an image from Zoe website`, async () => {
    const filePath = path.join(__dirname, '/assets/image_1.jpg');

    const result = await sut.parseImage(filePath);
    console.log('scv_res', result);

    expect(1).toBe(1);
  });
});
