import { regularMessages, messagesWithMinutes } from './stubs/messages';
import { CherkoeTgParser } from '../../../services/cherkoe/cherkoe-tg-parser';
import * as utilsModule from '../../../common/utils';
import { MONTH_NAMES } from '../../../common/utils';

const sut = new CherkoeTgParser();

describe.each(regularMessages)('Parse Regular Messages', (testMessage) => {
  beforeEach(() => jest.useFakeTimers({ now: new Date('2025-12-15T12:00:00+02:00') }));
  afterEach(() => jest.useRealTimers());

  it(`${testMessage.messageNumber}`, async () => {

    const parsedMessage = sut.parseMessage(testMessage.message);

    expect(parsedMessage).toEqual(testMessage.expectedResult);
  });
});

describe.each(messagesWithMinutes)('Parse Messages with minutes', (testMessage) => {
  beforeEach(() => jest.useFakeTimers({ now: new Date('2025-10-21T12:00:00+03:00') }));
  afterEach(() => jest.useRealTimers());

  it(`${testMessage.messageNumber}`, async () => {

    const parsedMessage = sut.parseMessage(testMessage.message);

    expect(parsedMessage).toEqual(testMessage.expectedResult);
  });
});
