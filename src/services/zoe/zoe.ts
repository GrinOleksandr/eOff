import config from '../../config';
import { TotalList } from 'telegram/Helpers';
import { getTelegramClient, getTodayAndTomorrowDate, MONTH_NAMES } from '../cherkoe/utils';
import { cherkoeTgParser } from '../cherkoe/cherkoe-tg-parser';
import { Api } from 'telegram';
import { EoffEvent, ISchedule } from '../../common/types-and-interfaces';

export class ZoeService {
  private daysScheduleData: { [index: string]: EoffEvent[] } = {};

  constructor() {}

  async getSchedule(): Promise<null> {
    return null; //ToDo implement
  }
}

export const zoeService = new ZoeService();
