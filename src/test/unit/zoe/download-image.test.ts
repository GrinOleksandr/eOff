import { ZoeImageParser } from '../../../services/zoe/zoe-image-parser';
import * as fs from 'node:fs';
import path from 'path';

const sut = new ZoeImageParser();

describe('Download image', () => {
  it(`Should download an image from Zoe website`, async () => {
    const filePath = path.join(__dirname, '/tmp/image_1.jpg');

    const fileExists = fs.existsSync(filePath);
    if (fileExists) {
      await fs.promises.unlink(filePath); // Delete the file
      console.log(`Deleted file: ${filePath}`);
    }

    console.info('Downloading image...');

    await sut.downloadImage(
      'https://www.zoe.com.ua/wp-content/uploads/2024/11/photo_2024-11-24_19-28-58.jpg',
      filePath
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.info('Image downloaded...');

    const stillExists = fs.existsSync(filePath);

    expect(stillExists).toBe(true);
  });
});
