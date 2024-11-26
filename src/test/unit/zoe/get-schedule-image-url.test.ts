import { ZoeImageParser } from '../../../services/zoe/zoe-image-parser';

const sut = new ZoeImageParser();

describe('Get image url', () => {
  it(`Should get image URL from Zoe website`, async () => {
    const result = await sut.getScheduleImageUrl();

    expect(typeof result).toBe('string');
    expect(result).toContain('https://www.zoe.com.ua/wp-content/uploads/');
    expect(result).toContain('.jpg');
  });
});
