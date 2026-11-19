import { CherkoeTgParser } from '../../../services/cherkoe/cherkoe-tg-parser';
import * as utilsModule from '../../../common/utils';
import { MONTH_NAMES } from '../../../common/utils';
import { messages, expectedResult } from './stubs/preserve-past-events-2';
import { EoffEvent } from '../../../common/types-and-interfaces';

const sut = new CherkoeTgParser();

describe('Preserve Past events', () => {
  it(`Should success`, async () => {
    jest.useFakeTimers({ now: new Date('2025-12-15T20:00:00+02:00') });

    // @ts-ignore
    const parsedMessage: ISchedule = sut.convertMessagesToEvents(messages);

    console.log(
      'scv_found',
      parsedMessage.events.filter((event: EoffEvent) => event.queue === '5.2')
    );

    expect(parsedMessage).toEqual(expectedResult);
    jest.useRealTimers();
  });
});
