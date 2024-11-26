import config from '../../config';
import { getFormattedDate, getNewKyivDate, getTelegramClient, getTodayAndTomorrowDate, MONTH_NAMES } from './utils';
import { cherkoeTgParser, IParsedTgMessage } from './cherkoe-tg-parser';
import { TotalList } from 'telegram/Helpers';
import { Api } from 'telegram';
import { EoffEvent, ISchedule } from '../../common/types-and-interfaces';

export class CherkoeService {
  private daysScheduleData: { [index: string]: EoffEvent[] } = {};

  constructor() {}

  async getSchedule(): Promise<ISchedule> {
    let lastMessages: TotalList<Api.Message> = [];

    try {
      const client = await getTelegramClient();

      // Getting the channel entity
      const cherkoeChannel = await client.getEntity(config.telegram.cherkoeChannel);

      // Fetching the last 20 messages from the channel
      lastMessages = await client.getMessages(cherkoeChannel, {
        limit: config.telegram.MESSAGES_LIMIT,
      });

      lastMessages.reverse();
    } catch (e) {
      console.error('Telegram API error: ', e);
    }

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
