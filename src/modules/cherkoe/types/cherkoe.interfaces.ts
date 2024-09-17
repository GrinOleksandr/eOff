import { IEoffEvent } from '../../../common/types';

export interface ParsedScheduleString {
  queue: string;
  startTime: string;
  endTime: string;
}

export interface GroupByQueueResult {
  [queue: string]: { startTime: string; endTime: string }[];
}

export interface IParsedTgMessage {
  targetDate: string | null;
  eventsList: void | IEoffEvent[];
}

export interface DateObj {
  year: number;
  name: string;
  index: number;
}
