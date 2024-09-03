import config from '../config';
import { getFormattedDate, getNewKyivDate, getTelegramClient } from '../common/utils';
import { cherkoeTgParser, IParsedTgMessage } from './cherkoe-tg-parser';

// const daysScheduleData = {};

const debugFunc = () => {
  const currentDate = getNewKyivDate();
  console.log('currentDate:', currentDate);
  // console.log('Current Date and Time:', currentDate.toString());
  // console.log('UTC Date and Time:', currentDate.toUTCString());
  // console.log('ISO Date and Time:', currentDate.toISOString());
};

export interface EoffEvent {
  startTime: string; // e.g. "18:00"
  endTime: string; // e.g. "18:00"
  queue: string; // e.g. "2"
  date: string; // e.g. "2024-09-02"
  electricity: string; // "on"/"off"
  provider: string; // "CHERKOE"
}

export interface ISchedule {
  events: EoffEvent[];
  hasTodayData: boolean;
  hasTomorrowData: boolean;
}

export class CherkoeService {
  private daysScheduleData: { [index: string]: EoffEvent[] } = {};

  constructor() {}

  async getSchedule(): Promise<ISchedule> {
    const today = getNewKyivDate();
    const todayDate = getFormattedDate(today);

    const tomorrow = today.clone().add(1, 'day');
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
        const parsedMessage: IParsedTgMessage | null = cherkoeTgParser.parseMessage(message.message);

        if (!parsedMessage?.targetDate) {
          return;
        }

        this.daysScheduleData[parsedMessage.targetDate] = parsedMessage.eventsList || [];
      }
    });

    // console.log('daysScheduleData', daysScheduleData);

    const result: ISchedule = { events: [], hasTodayData: false, hasTomorrowData: false };

    if (this.daysScheduleData[todayDate]) {
      result.events = [...result.events, ...this.daysScheduleData[todayDate]];
      result.hasTodayData = true;
    }

    if (this.daysScheduleData[tomorrowDate]) {
      result.events = [...result.events, ...this.daysScheduleData[tomorrowDate]];
      result.hasTomorrowData = true;
    }

    return result;
  }
}

export const cherkoeService = new CherkoeService();
