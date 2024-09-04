import { cherkoeTgParser } from '../../services/cherkoe-tg-parser';
import { linesForQueueNumbers } from './stubs/linesForQueueNumbers';

const sut = cherkoeTgParser.parseQueueNumbers;

describe.each(linesForQueueNumbers)('Parse queue numbers', (testLine) => {
  it(`${testLine.index}`, async () => {
    const result = sut(testLine.line);

    expect(result).toEqual(testLine.expectedResult);
  });
});
