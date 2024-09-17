import { CherkoeTgParser } from '../../../modules/cherkoe/cherkoe-tg-parser.service';
import { linesForQueueNumbers } from './stubs/linesForQueueNumbers';

const sut = new CherkoeTgParser();

describe.each(linesForQueueNumbers)('Parse queue numbers', (testLine) => {
  it(`${testLine.index}`, async () => {
    const result = sut.parseQueueNumbers(testLine.line);

    expect(result).toEqual(testLine.expectedResult);
  });
});
