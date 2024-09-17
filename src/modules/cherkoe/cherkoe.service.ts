import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { TotalList } from 'telegram/Helpers';
import { Api } from 'telegram';
import { ISchedule, IEoffEvent } from '../../common/types';
import { CherkoeTgParser } from './cherkoe-tg-parser.service';
import config from '../../config';
import { getTelegramClient, getTodayAndTomorrowDate, MONTH_NAMES } from './utils';
import { DAY, MESSAGE_TYPE } from './types/cherkoe.enums';


@Injectable()
export class CherkoeService {
  constructor(
    @Inject(forwardRef(() => CherkoeTgParser))
    private readonly cherkoeTgParser: CherkoeTgParser,
  ) {
  }

  async getSchedule(): Promise<ISchedule> {
    const client = await getTelegramClient().catch(err => {
      console.error('Error getting Telegram client:', err);
      throw new Error('Failed to get Telegram client');
    });

    // Getting the channel entity
    const channel = await client.getEntity(config.telegram.channelUsername);

    // Fetching the last N messages from the channel
    const lastMessages: TotalList<Api.Message> = await client.getMessages(channel, {
      limit: config.telegram.MESSAGES_LIMIT,
    });

    lastMessages.reverse();

    return this.cherkoeTgParser.convertMessagesToEvents(lastMessages);
  }

  async getMessage(type: MESSAGE_TYPE, queue: string, day: DAY): Promise<string> {
    const schedule: ISchedule = await this.getSchedule();

    const { todayDate, tomorrowDate } = getTodayAndTomorrowDate();

    const targetDate = day === 'today' ? todayDate : tomorrowDate;

    const filteredSchedule: IEoffEvent[] = schedule.events.filter(
      (event) => event.queue === queue && event.date === targetDate,
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
