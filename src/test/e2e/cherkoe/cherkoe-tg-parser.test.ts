import { regularMessages, messagesWithMinutes } from './stubs/messages';
import { CherkoeTgParser } from '../../../services/cherkoe/cherkoe-tg-parser';
import * as utilsModule from '../../../services/cherkoe/utils';
import { MONTH_NAMES } from '../../../services/cherkoe/utils';

const sut = new CherkoeTgParser();

describe.each(regularMessages)('Parse Regular Messages', (testMessage) => {
  it(`${testMessage.messageNumber}`, async () => {
    jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({ index: 9, name: MONTH_NAMES[11], year: 2024 });

    const parsedMessage = sut.parseMessage(testMessage.message);

    expect(parsedMessage).toEqual(testMessage.expectedResult);
  });
});

// describe.each(messagesWithMinutes)('Parse Messages with minutes', (testMessage) => {
//   it(`${testMessage.messageNumber}`, async () => {
//     jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({ index: 9, name: MONTH_NAMES[8], year: 2024 });
//
//     const parsedMessage = sut.parseMessage(testMessage.message);
//
//     expect(parsedMessage).toEqual(testMessage.expectedResult);
//   });
// });
