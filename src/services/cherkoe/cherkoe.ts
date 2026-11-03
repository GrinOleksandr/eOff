import config from '../../config';
import { getTodayAndTomorrowDate, MONTH_NAMES } from '../../common/utils';
import { getChannelMessages } from '../../common/telegram';
import { cherkoeTgParser } from './cherkoe-tg-parser';
import { EoffEvent, ISchedule } from '../../common/types-and-interfaces';

export class CherkoeService {
  constructor() {}

  async getSchedule(): Promise<ISchedule> {
    const lastMessages = await getChannelMessages(config.telegram.cherkoeChannel);

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
