import config from '../config';
import { getTelegramClient, getTodayAndTomorrowDate, MONTH_NAMES } from '../common/utils';
import { cherkoeTgParser, IParsedTgMessage } from './cherkoe-tg-parser';
import { TotalList } from 'telegram/Helpers';
import { Api } from 'telegram';

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
  async getSchedule(): Promise<ISchedule> {
    const client = await getTelegramClient();

    // Getting the channel entity
    const channel = await client.getEntity(config.telegram.channelUsername);
    console.log('Channel ID:', channel.id.toString());

    // Fetching the last N messages from the channel
    const lastMessages: TotalList<Api.Message> = await client.getMessages(channel, {
      limit: config.telegram.MESSAGES_LIMIT,
    });

    lastMessages.reverse();

    return cherkoeTgParser.convertMessagesToEvents(lastMessages);
  }

  async getMessage(type: string, queue: string, day: string): Promise<string> {
    const schedule: ISchedule = await this.getSchedule();

    const { todayDate, tomorrowDate } = getTodayAndTomorrowDate();

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
