import config from '../../config';
import { getTelegramClient, getTodayAndTomorrowDate, MONTH_NAMES } from '../../common/utils';
import { cherkoeTgParser } from './cherkoe-tg-parser';
import { TotalList } from 'telegram/Helpers';
import { Api } from 'telegram';
import { EoffEvent, ISchedule } from '../../common/types-and-interfaces';
import { withTelegramLock } from '../../common/telegram-lock';

export class CherkoeService {
  constructor() {}

  async getSchedule(): Promise<ISchedule> {
    return withTelegramLock(async () => {
      const client = await getTelegramClient();

      try {
        const cherkoeChannel = await client.getEntity(config.telegram.cherkoeChannel);

        const lastMessages: TotalList<Api.Message> = await client.getMessages(cherkoeChannel, {
          limit: config.telegram.MESSAGES_LIMIT,
        });

        lastMessages.reverse();

        return cherkoeTgParser.convertMessagesToEvents(lastMessages);
      } finally {
        await client.disconnect();
      }
    });
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
