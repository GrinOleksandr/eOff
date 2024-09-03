import config from '../config';
import { formatDateFromObject, getCurrentMonth, getNewKyivDate, getNextMonth } from '../common/utils';
import { EoffEvent } from './cherkoe';

type ParsedScheduleString = { queue: any; timeZoneIndex: string };

type GroupByQueueResult = {
  [key: string]: string[];
};

export interface IParsedTgMessage {
  targetDate: string | null;
  eventsList: void | EoffEvent[];
}

const debugFunc = () => {
  const currentDate = getNewKyivDate();
  console.log('currentDate:', currentDate);
  // console.log('Current Date and Time:', currentDate.toString());
  // console.log('UTC Date and Time:', currentDate.toUTCString());
  // console.log('ISO Date and Time:', currentDate.toISOString());
};

export class CherkoeTgParser {
  constructor() {}

  getTargetDate = (message: string) => {
    const currentMonth = getCurrentMonth();
    const nextMonth = getNextMonth();

    let target;
    if (message.toUpperCase().includes(currentMonth.name.toUpperCase())) {
      target = currentMonth;
    } else if (message.toUpperCase().includes(nextMonth.name.toUpperCase())) {
      target = nextMonth;
    } else {
      return null;
    }

    const targetDayString = message.toUpperCase().split(` ${target.name.toUpperCase()}`)[0].trim();
    const targetDayMatch = targetDayString.match(/\d+$/);
    const targetDay = targetDayMatch ? parseInt(targetDayMatch[0]) : null;

    return formatDateFromObject({ ...target, day: targetDay });
  };

  private parseQueueNumbers = (line: string) => {
    const splittedLine = line.split('00');
    return splittedLine[splittedLine.length - 1].match(/\d+/g);
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

    const stringedSchedule = schedule.split('\n\n');

    const stringFilterPattern = /\d+:00-\d+:00.*черг.*/;
    const filteredSchedule = stringedSchedule
      .filter((line) => stringFilterPattern.test(line))
      .join('\n')
      .split('\n');

    const offlineHours: ParsedScheduleString[] = [];

    filteredSchedule.forEach((line) => {
      const queues = this.parseQueueNumbers(line);
      const timeZoneIndex = line.split(':')[0];

      if (!queues) return;

      queues.forEach((queue) => {
        offlineHours.push({ queue, timeZoneIndex });
      });
    });

    return offlineHours;
  };

  private indexToHours(timeZoneIndex: number) {
    const startHour = timeZoneIndex; // 1 hour per timezoneIndex
    const endHour = startHour + 1; // Each timezoneIndex is 1 hour duration
    return {
      startHour: `${startHour.toString().padStart(2, '0')}:00`,
      endHour: `${endHour.toString().padStart(2, '0')}:00`,
    };
  }

  private groupByQueue = (data: ParsedScheduleString[]): GroupByQueueResult =>
    data.reduce((acc: GroupByQueueResult, { queue, timeZoneIndex }) => {
      if (!acc[queue]) {
        acc[queue] = [];
      }
      acc[queue].push(timeZoneIndex);
      return acc;
    }, {});

  private convertToEvents = (scheduleData: GroupByQueueResult, date: string | null): EoffEvent[] => {
    // Convert grouped data to events
    return Object.entries(scheduleData).flatMap(([queue, timeZones]) => {
      if (timeZones.length === 0) return [];

      timeZones.sort((a, b) => parseInt(a) - parseInt(b)); // Ensure the timeZones are sorted
      let currentStartIndex = parseInt(timeZones[0], 10);
      let currentEndIndex = parseInt(timeZones[0], 10);
      const result = [];

      const defaultValuesObj = { queue, date: date || '', electricity: 'off', provider: config.providerName };

      for (let i = 1; i < timeZones.length; i++) {
        const currentZone = parseInt(timeZones[i], 10);

        if (currentZone === currentEndIndex + 1) {
          currentEndIndex = currentZone;
        } else {
          const { startHour: startTime } = this.indexToHours(currentStartIndex);
          const { endHour: endTime } = this.indexToHours(currentEndIndex);
          result.push({ ...defaultValuesObj, startTime, endTime });

          currentStartIndex = currentZone;
          currentEndIndex = currentZone;
        }
      }

      // Add last range
      const { startHour: startTime } = this.indexToHours(currentStartIndex);
      const { endHour: endTime } = this.indexToHours(currentEndIndex);
      result.push({ ...defaultValuesObj, startTime, endTime });

      return result;
    });
  };

  parseMessage = (message: string): IParsedTgMessage | null => {
    const targetDate: string | null = this.getTargetDate(message);

    const parsedSchedule: ParsedScheduleString[] | null = this.parseSchedule(message);

    if (!parsedSchedule) return null;

    const groupedByQueue: GroupByQueueResult = this.groupByQueue(parsedSchedule);

    const eventsList: EoffEvent[] | void = this.convertToEvents(groupedByQueue, targetDate);
    if (!eventsList || !targetDate) return null;
    return { targetDate, eventsList };
  };
}

export const cherkoeTgParser = new CherkoeTgParser();
