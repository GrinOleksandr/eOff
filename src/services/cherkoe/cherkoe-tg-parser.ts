import config from '../../config';
import { DateObj, formatDateFromObject, getCurrentMonth, getNextMonth, getTodayAndTomorrowDate } from './utils';
import { EoffEvent, ISchedule } from './cherkoe';
import { TotalList } from 'telegram/Helpers';
import { Api } from 'telegram';
import { ELECTRICITY_PROVIDER, ELECTRICITY_STATUS, IEoffEvent } from '../../common/types-and-interfaces';
import Message = Api.Message;

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
  eventsList: void | IEoffEvent[];
}

export class CherkoeTgParser {
  private daysScheduleData: { [index: string]: IEoffEvent[] } = {};

  getTargetDate = (message: string) => {
    const currentMonth: DateObj = getCurrentMonth();
    const nextMonth: DateObj = getNextMonth();
    console.log('scv_currentMonth', currentMonth, nextMonth);
    let target;
    if (message.toUpperCase().includes(currentMonth.name.toUpperCase())) {
      console.log('scv_case_1');
      target = currentMonth;
    } else if (message.toUpperCase().includes(nextMonth.name.toUpperCase())) {
      console.log('scv_case_2');
      target = nextMonth;
    } else {
      return null;
    }

    const targetDayString: string = message.toUpperCase().split(` ${target.name.toUpperCase()}`)[0].trim();
    const targetDayMatch = targetDayString.match(/\d+$/);
    const targetDay: number | null = targetDayMatch ? parseInt(targetDayMatch[0]) : null;

    if (!targetDay) return null;

    return formatDateFromObject({ ...target, day: targetDay });
  };

  public parseQueueNumbers = (line: string): string[] | null => {
    // Use regex to split the line by time intervals and capture queue numbers
    const parts: string[] = line.split(' ');

    // Extract the last part (which should contain queue numbers)
    const queuePart: string = parts[0];

    const queuesMap = {
      '1.І': '1.1',
      '1.ІІ': '1.2',
      '2.І': '2.1',
      '2.ІІ': '2.2',
      '3.І': '3.1',
      '3.ІІ': '3.2',
      '4.І': '4.1',
      '4.ІІ': '4.2',
      '5.І': '5.1',
      '5.ІІ': '5.2',
      '6.І': '6.1',
      '6.ІІ': '6.2',
    };

    // @ts-ignore
    console.log('scv_queuePart', queuePart, ' ->> ', queuesMap[queuePart]);

    return queuePart && queuesMap[queuePart as keyof typeof queuesMap]
      ? [queuesMap[queuePart as keyof typeof queuesMap]]
      : null;
  };

  private parseSchedule = (message: string): ParsedScheduleString[] | null => {
    const passPhrase1 = 'Години відсутності електропостачання по чергам (підчергам):';
    const passPhrase2 = 'Години відсутності електропостачання по чергам (підчергам)';

    let schedule;

    if (message.includes(passPhrase1)) {
      console.log('scv_passPhrase1');
      schedule = message.split(passPhrase1)[1];
    } else if (message.includes(passPhrase2)) {
      console.log('scv_passPhrase2');
      schedule = message.split(passPhrase2)[1];
    } else {
      return null;
    }

    // const stringedSchedule: string[] = schedule.split('\n\n');
    // console.log('scv_stringified, ', stringedSchedule);

    // Split the message into lines and filter out empty ones
    let lines: string[] = message
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');

    // Convert to JSON string (for handling invisible characters)
    const stringifiedLines = JSON.stringify(lines);

    // Parse the stringified lines back into an array
    let parsedLines: string[] = JSON.parse(stringifiedLines);

    const regex: RegExp = /^\d+\.\І{1,2}.*$/;

    // Filter lines that match the pattern
    const filteredLines: string[] = parsedLines.filter((line) => regex.test(line));

    // Convert filtered lines to JSON for clear output
    const stringedSchedule: string = JSON.stringify(filteredLines, null, 2);
    console.log('scv_jsonString', stringedSchedule);
    const stringFilterPattern: RegExp = /^\s*\d+\.\І{1,2}/gm;

    // const filteredSchedule: string[] = stringedSchedule
    //   .filter((line) => {
    //     const normalizedLine = line
    //       .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
    //       .replace(/\r\n|\r|\n/g, '\n') // Normalize newlines
    //       .trim();
    //
    //     return stringFilterPattern.test(normalizedLine);
    //   })
    //   .join('\n')
    //   .split('\n');
    console.log('scv_filteredSchedule', filteredLines);
    const offlineHours: ParsedScheduleString[] = [];

    filteredLines.forEach((line) => {
      const queues: string[] | null = this.parseQueueNumbers(line);

      const allTimeMatches = [...line.matchAll(/(\d{2}:\d{2})-(\d{2}:\d{2})/g)];

      if (!queues || !allTimeMatches?.length) return;

      queues.forEach((queue) => {
        allTimeMatches.forEach((timeMatch) => {
          const [_, startTime, endTime] = timeMatch;
          offlineHours.push({ queue, startTime, endTime });
        });
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

  private convertToEvents = (scheduleData: GroupByQueueResult, date: string | null): IEoffEvent[] => {
    return Object.entries(scheduleData).flatMap(([queue, timeIntervals]) => {
      if (timeIntervals.length === 0) return [];

      timeIntervals.sort((a, b) => {
        const startA = a.startTime.split(':').map(Number);
        const startB = b.startTime.split(':').map(Number);
        return startA[0] - startB[0] || startA[1] - startB[1];
      });

      const result = [];
      const defaultValuesObj = {
        queue,
        date: date || '',
        electricity: ELECTRICITY_STATUS.OFF,
        provider: ELECTRICITY_PROVIDER.CHERKOE,
      };

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
    console.log('scv_TargetDate', targetDate);
    const parsedSchedule: ParsedScheduleString[] | null = this.parseSchedule(message);
    console.log('scv_parsedSchedule', parsedSchedule);
    if (!parsedSchedule) return null;

    const groupedByQueue: GroupByQueueResult = this.groupByQueue(parsedSchedule);
    console.log('scv_groupedByQueue', groupedByQueue);
    const eventsList: IEoffEvent[] | void = this.convertToEvents(groupedByQueue, targetDate);
    console.log('scv_eventsList', eventsList);
    if (!eventsList || !targetDate) return null;
    return { targetDate, eventsList };
  };

  convertMessagesToEvents(messages: TotalList<Api.Message>): ISchedule {
    messages.forEach((message) => {
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

    const { todayDate, tomorrowDate } = getTodayAndTomorrowDate();
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

export const cherkoeTgParser = new CherkoeTgParser();
