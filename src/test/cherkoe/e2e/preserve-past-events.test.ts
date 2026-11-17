import { CherkoeTgParser } from '../../../services/cherkoe/cherkoe-tg-parser';
import * as utilsModule from '../../../common/utils';
import { MONTH_NAMES } from '../../../common/utils';
import { messages, expectedResult } from './stubs/preserve-past-events';

const sut = new CherkoeTgParser();

describe('Preserve Past events', () => {
  it(`Should success`, async () => {
    jest.useFakeTimers({ now: new Date('2025-12-11T20:00:00+02:00') });

    // @ts-ignore
    const parsedMessage: ISchedule = sut.convertMessagesToEvents(messages);

    expect(parsedMessage).toEqual(expectedResult);
    jest.useRealTimers();
  });
});
