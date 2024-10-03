import config from '../config';
import { getFormattedDate, getNewKyivDate, getTelegramClient, MONTH_NAMES } from '../common/utils';
import { cherkoeTgParser, IParsedTgMessage } from './cherkoe-tg-parser';

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

  getTodayAndTomorrowDate(): { todayDate: string; tomorrowDate: string } {
    const today = getNewKyivDate();
    const todayDate = getFormattedDate(today);

    const tomorrow = today.clone().add(1, 'day');
    const tomorrowDate = getFormattedDate(tomorrow);

    return { todayDate, tomorrowDate };
  }

  async getSchedule(): Promise<ISchedule> {
    let lastMessages: any[] = []

    try {
      const client = await getTelegramClient();

      // Getting the channel entity
      const channel = await client.getEntity(config.telegram.channelUsername);

      // Fetching the last 20 messages from the channel
      lastMessages = await client.getMessages(channel, { limit: config.telegram.MESSAGES_LIMIT });

      lastMessages.reverse();
    } catch (e) {
      console.error('Telegram API error: ', e)
    }

    console.log('Getting schedule. Messages length', lastMessages.length)

    if(lastMessages.length){
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
    }

    // console.log('daysScheduleData', daysScheduleData);

    const { todayDate, tomorrowDate } = this.getTodayAndTomorrowDate();
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

  async getMessage(type: string, queue: string, day: string): Promise<string> {
    const schedule: ISchedule = await this.getSchedule();

    const { todayDate, tomorrowDate } = this.getTodayAndTomorrowDate();

    const targetDate = day === 'today' ? todayDate : tomorrowDate;

    const filteredSchedule: EoffEvent[] = schedule.events.filter(
      (event) => event.queue === queue && event.date === targetDate
    );

    const preparedSchedule = filteredSchedule.map((item) => `${item.startTime} - ${item.endTime}`);

    const monthNumber: number = parseInt(targetDate.split('-')[1]);
    const month = MONTH_NAMES[monthNumber - 1];

    const dayNumber = targetDate.split('-')[2];

    return type === 'update'
      ? `(!)Оновлений графік на ${dayNumber} ${month}:<br>${preparedSchedule.join('</br>')}`
      : `(lightening)${dayNumber} ${month} відключення:<br>${preparedSchedule.join('</br>')}`;
  }
}

export const cherkoeService = new CherkoeService();
