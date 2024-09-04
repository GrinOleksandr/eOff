import config from '../config';
import { DateObj, formatDateFromObject, getCurrentMonth, getNextMonth } from '../common/utils';
import { EoffEvent } from './cherkoe';

interface ParsedScheduleString {
  queue: string;
  startTime: string;
  endTime: string;
}

interface GroupByQueueResult {
  [queue: string]: { startTime: string; endTime: string }[];
}

export interface IParsedTgMessage {
  targetDate: string | null;
  eventsList: void | EoffEvent[];
}

export class CherkoeTgParser {
  constructor() {}

  getTargetDate = (message: string) => {
    const currentMonth: DateObj = getCurrentMonth();
    const nextMonth: DateObj = getNextMonth();

    let target;
    if (message.toUpperCase().includes(currentMonth.name.toUpperCase())) {
      target = currentMonth;
    } else if (message.toUpperCase().includes(nextMonth.name.toUpperCase())) {
      target = nextMonth;
    } else {
      return null;
    }

    const targetDayString: string = message.toUpperCase().split(` ${target.name.toUpperCase()}`)[0].trim();
    const targetDayMatch = targetDayString.match(/\d+$/);
    const targetDay: number | null = targetDayMatch ? parseInt(targetDayMatch[0]) : null;

    return formatDateFromObject({ ...target, day: targetDay });
  };

  public parseQueueNumbers = (line: string): string[] | null => {
    // Use regex to split the line by time intervals and capture queue numbers
    const parts: string[] = line.split(/(?:\d{2}:\d{2}-\d{2}:\d{2}\s*)+/);

    // Extract the last part (which should contain queue numbers)
    const queuePart: string = parts[parts.length - 1];

    // Use regex to match queue numbers
    const queueNumbers = queuePart.match(/\d+(?:,\d+)?/g);

    // Return the matched queue numbers or null if none found
    return queueNumbers ? queueNumbers.filter((queue) => /^\d+$/.test(queue)) : null;
  };

  private parseSchedule = (message: string): ParsedScheduleString[] | null => {
    const passPhrase1 = 'Години відсутності електропостачання:';
    const passPhrase2 = 'Години відсутності електропостачання';

    let schedule;

    if (message.includes(passPhrase1)) {
      schedule = message.split(passPhrase1)[1];
    } else if (message.includes(passPhrase2)) {
      schedule = message.split(passPhrase2)[1];
    } else {
      return null;
    }

    const stringedSchedule: string[] = schedule.split('\n\n');

    const stringFilterPattern: RegExp = /\d{2}:\d{2}-\d{2}:\d{2}.*черг.*/;
    const filteredSchedule: string[] = stringedSchedule
      .filter((line) => stringFilterPattern.test(line))
      .join('\n')
      .split('\n');

    const offlineHours: ParsedScheduleString[] = [];

    filteredSchedule.forEach((line) => {
      const queues: string[] | null = this.parseQueueNumbers(line);
      console.log('scv_queues', queues);
      const timeMatch = line.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);

      if (!queues || !timeMatch) return;

      const [_, startTime, endTime] = timeMatch;

      queues.forEach((queue) => {
        offlineHours.push({ queue, startTime, endTime });
      });
    });

    return offlineHours;
  };

  // private indexToHours(timeZoneIndex: number) {
  //   const startHour = timeZoneIndex; // 1 hour per timezoneIndex
  //   const endHour = startHour + 1; // Each timezoneIndex is 1 hour duration
  //   return {
  //     startHour: `${startHour.toString().padStart(2, '0')}:00`,
  //     endHour: `${endHour.toString().padStart(2, '0')}:00`,
  //   };
  // }

  private groupByQueue = (data: ParsedScheduleString[]): GroupByQueueResult =>
    data.reduce((acc: GroupByQueueResult, { queue, startTime, endTime }) => {
      if (!acc[queue]) {
        acc[queue] = [];
      }
      acc[queue].push({ startTime, endTime });
      return acc;
    }, {});

  private convertToEvents = (scheduleData: GroupByQueueResult, date: string | null): EoffEvent[] => {
    return Object.entries(scheduleData).flatMap(([queue, timeIntervals]) => {
      if (timeIntervals.length === 0) return [];

      timeIntervals.sort((a, b) => {
        const startA = a.startTime.split(':').map(Number);
        const startB = b.startTime.split(':').map(Number);
        return startA[0] - startB[0] || startA[1] - startB[1];
      });

      const result = [];
      const defaultValuesObj = { queue, date: date || '', electricity: 'off', provider: config.providerName };

      let currentStartTime: string = timeIntervals[0].startTime;
      let currentEndTime: string = timeIntervals[0].endTime;

      for (let i = 1; i < timeIntervals.length; i++) {
        const previousEndTime: string = currentEndTime;
        const { startTime, endTime } = timeIntervals[i];

        if (startTime === previousEndTime) {
          // If the current interval starts when the previous one ends, merge them
          currentEndTime = endTime;
        } else {
          // Push the previous merged interval to result
          result.push({ ...defaultValuesObj, startTime: currentStartTime, endTime: currentEndTime });

          // Start a new interval
          currentStartTime = startTime;
          currentEndTime = endTime;
        }
      }

      // Push the last interval
      result.push({ ...defaultValuesObj, startTime: currentStartTime, endTime: currentEndTime });

      return result;
    });
  };

  parseMessage = (message: string): IParsedTgMessage | null => {
    const targetDate: string | null = this.getTargetDate(message);

    const parsedSchedule: ParsedScheduleString[] | null = this.parseSchedule(message);
    console.log('scv_parsedSchedule', parsedSchedule);
    if (!parsedSchedule) return null;

    const groupedByQueue: GroupByQueueResult = this.groupByQueue(parsedSchedule);

    const eventsList: EoffEvent[] | void = this.convertToEvents(groupedByQueue, targetDate);
    console.log('scv_eventlist', targetDate, eventsList);
    if (!eventsList || !targetDate) return null;
    return { targetDate, eventsList };
  };
}

export const cherkoeTgParser = new CherkoeTgParser();
