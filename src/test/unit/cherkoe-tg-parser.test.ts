import { testMessages } from './stubs/messages';
import { cherkoeTgParser } from '../../services/cherkoe-tg-parser';
import * as utilsModule from '../../common/utils';
import { MONTH_NAMES } from '../../common/utils';

describe.each(testMessages)('parseMessage', (testMessage) => {
  const sut = cherkoeTgParser.parseMessage;

  it(`${testMessage.messageNumber}`, async () => {
    jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({ index: 9, name: MONTH_NAMES[8], year: 2024 });

    const parsedMessage = sut(testMessage.message);

    expect(parsedMessage).toEqual(testMessage.expectedResult);
  });
});
