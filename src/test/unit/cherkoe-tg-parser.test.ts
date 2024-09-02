import { testMessages } from './stubs/messages';
import { cherkoeTgParser } from '../../services/cherkoe-tg-parser';

describe.each(testMessages)('parseMessage', (testMessage) => {
  const sut = cherkoeTgParser.parseMessage;

  it(`${testMessage.messageNumber}`, async () => {
    const parsedMessage = sut(testMessage.message);

    expect(parsedMessage).toEqual(testMessage.expectedResult);
  });
});
