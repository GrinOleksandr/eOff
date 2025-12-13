import config from '../../config';
import { DateObj, formatDateFromObject, getCurrentMonth, getNextMonth, getTodayAndTomorrowDate } from './utils';
import { EoffEvent, ISchedule } from './cherkoe';
import { TotalList } from 'telegram/Helpers';
import { Api } from 'telegram';
import {
  ELECTRICITY_PROVIDER,
  ELECTRICITY_STATUS,
  IEoffEvent,
  ITargetDateObject,
} from '../../common/types-and-interfaces';
import Message = Api.Message;
import { message } from 'telegram/client';
import messages = Api.messages;

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

function getMessageTimeObjNow(messageTime: number): { dateStr: string; totalMinutes: number } {
  const time = new Date(messageTime);

  const year = time.getUTCFullYear();
  const month = String(time.getUTCMonth() + 1).padStart(2, '0');
  const day = String(time.getUTCDate()).padStart(2, '0');

  const dateStr = `${year}-${month}-${day}`;
  const totalMinutes = time.getUTCHours() * 60 + time.getUTCMinutes();

  return { dateStr, totalMinutes };
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  // Handle "24:00" as end of day (1440 minutes)
  if (hours === 24) {
    return 24 * 60;
  }
  return hours * 60 + minutes;
}

function mergeScheduleEvents(
  existingEvents: IEoffEvent[] | undefined,
  newEvents: IEoffEvent[],
  targetDate: string,
  messageTime: number
): IEoffEvent[] {
  // If no existing events, just return new ones
  if (!existingEvents || existingEvents.length === 0) {
    return newEvents;
  }

  const { dateStr: todayDateStr, totalMinutes: currentTimeMinutes } = getMessageTimeObjNow(messageTime);
  console.log('scv_currentTime', { dateStr: todayDateStr, totalMinutes: currentTimeMinutes });
  // If target date is in the past, keep new if present, otherwise existing
  if (targetDate < todayDateStr) {
    return newEvents.length > 0 ? newEvents : existingEvents;
  }

  // If target date is in the future, just use new events
  if (targetDate > todayDateStr) {
    return newEvents;
  }

  // Target date is TODAY - need smart merging
  const eventsToPreserve: IEoffEvent[] = [];

  for (const oldEvent of existingEvents) {
    // Check if this exact event exists in new data
    const existsInNew = newEvents.some(
      (newEvent) =>
        newEvent.queue === oldEvent.queue &&
        newEvent.startTime === oldEvent.startTime &&
        newEvent.endTime === oldEvent.endTime
    );

    if (!existsInNew) {
      // Event is missing from new data - check if it has completely passed
      const startMinutes = timeToMinutes(oldEvent.startTime);
      const endMinutes = timeToMinutes(oldEvent.endTime);

      // Both start AND end must be in the past to preserve
      if (startMinutes < currentTimeMinutes && endMinutes <= currentTimeMinutes) {
        eventsToPreserve.push(oldEvent);
      }
    }
  }
  console.log('scv_before_result', eventsToPreserve, newEvents);
  // Combine preserved old events with all new events
  return [...eventsToPreserve, ...newEvents];
}

export class CherkoeTgParser {
  private daysScheduleData: { [index: string]: IEoffEvent[] } = {};

  getTargetDate = (message: string): null | ITargetDateObject => {
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

    const result = { ...target, day: targetDay };

    return {
      targetDate: formatDateFromObject(result),
      rawDateObj: result,
    };
  };

  public parseQueueNumbers = (line: string): string[] | null => {
    // Use regex to split the line by time intervals and capture queue numbers
    const parts: string[] = line.split(' ');

    // Extract the last part (which should contain queue numbers)
    const queuePart: string = parts[0].trim();

    // Regex to match patterns like "2.1", "2.І", "2.II", "3.2", "3.ІІ" with optional trailing dot
    const match = queuePart.match(/^(\d+)\.(І|ІІ|I|II|\d+)(\.)?$/);

    if (!match) {
      // @ts-ignore
      console.log('scv_queuePart NO MATCH', queuePart);
      return null;
    }

    let sub = match[2];
    if (sub === 'І' || sub === 'I') {
      sub = '1';
    } else if (sub === 'ІІ' || sub === 'II') {
      sub = '2';
    }
    // If it's already a digit (e.g., '1' or '2'), sub remains as-is

    const normalizedQueue = `${match[1]}.${sub}`;

    // @ts-ignore
    console.log('scv_queuePart', queuePart, ' ->> ', normalizedQueue);

    return [normalizedQueue];
  };

  private parseSchedule = (
    message: string,
    rawDateObj: ITargetDateObject['rawDateObj']
  ): ParsedScheduleString[] | null => {
    const wholeDayCancellationPhrase = `${rawDateObj.day} ${rawDateObj.name} по Черкаській області скасовано графіки погодинних відключень`;
    console.log('scv_wholeDayCancelationPassphrase', wholeDayCancellationPhrase);

    if (message.includes(wholeDayCancellationPhrase)) return [];

    const phrase1 = 'Години відсутності електропостачання по чергам (підчергам):';
    const phrase2 = 'Години відсутності електропостачання по чергам (підчергам)';
    const phrase3 = 'Оновлений графік погодинних відключень';
    const phrase4 = 'Години відсутності електропостачання:';
    const phrase5 = 'Будуть застосовані графіки погодинних відключень';
    const phrase6 = 'ГПВ діятиме з';
    const phrase7 = 'погодинних відключень';
    const phrase8 = 'погодинних вимкнень';

    let schedule;

    if (message.includes(phrase1)) {
      console.log('scv_passPhrase1');
      schedule = message.split(phrase1)[1];
    } else if (message.includes(phrase2)) {
      console.log('scv_passPhrase2');
      schedule = message.split(phrase2)[1];
    } else if (
      (message.includes(phrase3) && message.includes(phrase4)) ||
      (message.toLowerCase().includes(phrase5.toLowerCase()) &&
        message.toUpperCase().includes(phrase4.toUpperCase())) ||
      (message.toLowerCase().includes(phrase6.toLowerCase()) &&
        message.toUpperCase().includes(phrase4.toUpperCase())) ||
      (message.toLowerCase().includes(phrase7.toLowerCase()) &&
        message.toUpperCase().includes(phrase4.toUpperCase())) ||
      (message.toLowerCase().includes(phrase8.toLowerCase()) && message.toUpperCase().includes(phrase4.toUpperCase()))
    ) {
      console.log('scv_passPhrase3');
      schedule = message.split(phrase4)[1];
    } else {
      console.error('scv_noPassPhrase_FOUND! in message: ', message);
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
    console.log('scv_parsedLines', parsedLines);
    const regex: RegExp = /^\d+\.(?:\d+|І{1,2})\s*.*$/;

    // Filter lines that match the pattern
    let filteredLines: string[] = parsedLines.filter((line) => regex.test(line));
    // if(!filteredLines.length){
    //   const regex2 =
    // }
    console.log('scv_filteredLines', filteredLines);
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
      console.log('scv_parsing_line', line);
      const queues: string[] | null = this.parseQueueNumbers(line);
      console.log('scv_queues_parsed', queues);
      const allTimeMatches = [...line.matchAll(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/g)];
      console.log('scv_allTimeMatches', allTimeMatches);
      if (!queues || !allTimeMatches?.length) return;

      queues.forEach((queue) => {
        allTimeMatches.forEach((timeMatch) => {
          let [_, startTime, endTime] = timeMatch;

          if (endTime.startsWith('00:')) {
            endTime = endTime.replace('00:', '24:');
          }

          offlineHours.push({ queue, startTime, endTime });
        });
      });
    });

    return offlineHours;
  };

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
    const targetDateResult: null | ITargetDateObject = this.getTargetDate(message);
    if (!targetDateResult) return null;
    const { targetDate, rawDateObj } = targetDateResult;
    console.log('scv_TargetDate', targetDate);
    const parsedSchedule: ParsedScheduleString[] | null = this.parseSchedule(message, rawDateObj);
    console.log('scv_parsedSchedule', parsedSchedule);
    if (!parsedSchedule) return null;

    const groupedByQueue: GroupByQueueResult = this.groupByQueue(parsedSchedule);
    console.log('scv_groupedByQueue', groupedByQueue);
    const eventsList: IEoffEvent[] | void = this.convertToEvents(groupedByQueue, targetDate);
    console.log('scv_eventsList', eventsList);
    if (!eventsList) return null;
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

        this.daysScheduleData[parsedMessage.targetDate] = mergeScheduleEvents(
          this.daysScheduleData[parsedMessage.targetDate],
          parsedMessage.eventsList || [],
          parsedMessage.targetDate,
          message.date * 1000
        );
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

    result.events.sort((a, b) => {
      // First sort by queue
      if (a.queue !== b.queue) {
        return parseFloat(a.queue) - parseFloat(b.queue);
      }
      // Then by startTime
      return a.startTime.localeCompare(b.startTime);
    });
    console.log('scv_final_res', result);
    return result;
  }
}

export const cherkoeTgParser = new CherkoeTgParser();
