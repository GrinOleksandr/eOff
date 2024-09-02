import { parseMessage } from './parser.js';
import config from '../../config.js';
import { getFormattedDate, getNewKyivDate, getTelegramClient } from './utils.js';

const daysScheduleData = {};

const debugFunc = () => {
  const currentDate = getNewKyivDate();
  console.log('Current Date and Time:', currentDate.toString());
  console.log('UTC Date and Time:', currentDate.toUTCString());
  console.log('ISO Date and Time:', currentDate.toISOString());
};

const getDataForCherkOE = async () => {
  const today = getNewKyivDate();
  const todayDate = getFormattedDate(today);

  const tomorrow = getNewKyivDate();
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowDate = getFormattedDate(tomorrow);

  console.log('Processing data for CHERKOE');
  console.log('todayDate', todayDate, today);
  console.log('tomorrowDate', tomorrowDate, tomorrow);

  debugFunc();

  const client = await getTelegramClient();

  // Getting the channel entity
  const channel = await client.getEntity(config.telegram.channelUsername);
  console.log('Channel ID:', channel.id.toString());

  // Fetching the last 20 messages from the channel
  const lastMessages = await client.getMessages(channel, { limit: config.telegram.MESSAGES_LIMIT });

  lastMessages.reverse();

  lastMessages.forEach((message) => {
    if (message.message) {
      // console.log(`Message from ${config.telegram.channelUsername}: ${message.message}`)
      const parsedMessage = parseMessage(message.message);

      if (!parsedMessage) {
        return;
      }

      daysScheduleData[parsedMessage.targetDate] = parsedMessage.eventsList;
    }
  });

  // console.log('daysScheduleData', daysScheduleData);

  const result = { events: [], hasTodayData: false, hasTomorrowData: false };

  if (daysScheduleData[todayDate]) {
    result.events = [...result.events, ...daysScheduleData[todayDate]];
    result.hasTodayData = true;
  }

  if (daysScheduleData[tomorrowDate]) {
    result.events = [...result.events, ...daysScheduleData[tomorrowDate]];
    result.hasTomorrowData = true;
  }

  return result;
};

export { getDataForCherkOE };
