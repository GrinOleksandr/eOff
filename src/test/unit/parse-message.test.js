import { testMessages } from './testData/index.js'
import { parseMessage } from '../../eOff/cherkoe/parser.js'

describe.each(testMessages)('parseMessage', (testMessage) => {
  it(`${testMessage.messageNumber}`, async () => {
    const parsedMessage = parseMessage(testMessage.message)

    expect(parsedMessage).toEqual(testMessage.expectedResult)
  })
})
