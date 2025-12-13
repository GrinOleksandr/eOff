import { CherkoeTgParser } from '../../../services/cherkoe/cherkoe-tg-parser';
import * as utilsModule from '../../../services/cherkoe/utils';
import { MONTH_NAMES } from '../../../services/cherkoe/utils';
import { messages, expectedResult } from './stubs/preserve-past-events-2';

const sut = new CherkoeTgParser();

describe('Preserve Past events', () => {
  it(`Should success`, async () => {
    jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({ index: 12, name: MONTH_NAMES[11], year: 2025 });

    // @ts-ignore
    const parsedMessage: ISchedule = sut.convertMessagesToEvents(messages);

    expect(parsedMessage).toEqual(expectedResult);
  });
});
