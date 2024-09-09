import { regularMessages, messagesWithMinutes } from './stubs/messages';
import { cherkoeTgParser } from '../../services/cherkoe-tg-parser';
import * as utilsModule from '../../common/utils';
import { MONTH_NAMES } from '../../common/utils';

const sut = cherkoeTgParser;

describe.each(regularMessages)('Parse Regular Messages', (testMessage) => {
  it(`${testMessage.messageNumber}`, async () => {
    jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({ index: 9, name: MONTH_NAMES[8], year: 2024 });

    const parsedMessage = sut.parseMessage(testMessage.message);

    expect(parsedMessage).toEqual(testMessage.expectedResult);
  });
});

describe.each(messagesWithMinutes)('Parse Messages with minutes', (testMessage) => {
  it(`${testMessage.messageNumber}`, async () => {
    jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({ index: 9, name: MONTH_NAMES[8], year: 2024 });

    const parsedMessage = sut.parseMessage(testMessage.message);

    expect(parsedMessage).toEqual(testMessage.expectedResult);
  });
});
