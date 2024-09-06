import config from '../config';
import {
  DateObj,
  formatDateFromObject,
  getCurrentMonth,
  getNewKyivDate,
  getNextMonth,
  getTodayAndTomorrowDate,
  toKyivDate,
} from '../common/utils';
import { EoffEvent, ISchedule } from './cherkoe';
import { TotalList } from 'telegram/Helpers';
import { Api } from 'telegram';
import moment from 'moment-timezone';

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
  private daysScheduleData: { [index: string]: EoffEvent[] } = {};

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
      console.error('No schedule detected');
      return null;
    }
    console.log('scv_schedule', schedule);

    const stringedSchedule: string[] = schedule.split('\n\n');
    console.log('scv_stringedSchedule', stringedSchedule);
    const stringFilterPattern: RegExp = /\d{2}:\d{2}-\d{2}:\d{2}.*черг.*/;
    const filteredSchedule: string[] = stringedSchedule
      .filter((line) => stringFilterPattern.test(line))
      .join('\n')
      .split('\n');
    console.log('scv_filteredSchedule', filteredSchedule);
    const offlineHours: ParsedScheduleString[] = [];

    filteredSchedule.forEach((line) => {
      const queues: string[] | null = this.parseQueueNumbers(line);

      const timeMatch = line.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);

      if (!queues || !timeMatch) return;

      const [_, startTime, endTime] = timeMatch;

      queues.forEach((queue) => {
        offlineHours.push({ queue, startTime, endTime });
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

  private convertToEvents = (scheduleData: GroupByQueueResult, date: string): EoffEvent[] => {
    console.log('scv_scheduleData', scheduleData);

    const currentDateTime = moment.tz('Europe/Kyiv'); // Assuming Kyiv time zone
    const today = moment(date, 'YYYY-MM-DD').tz('Europe/Kyiv');

    // Retrieve existing events (if any) from this.daysScheduleData
    const existingEvents: EoffEvent[] = this.daysScheduleData[date] || [];

    // Create a new set to track new events from scheduleData
    const newEventSet = new Set();

    // Prepare the result array for new events
    const newEvents = Object.entries(scheduleData).flatMap(([queue, timeIntervals]) => {
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

        console.log('scv_merging', queue, startTime, previousEndTime);

        if (startTime === previousEndTime) {
          console.log('scv_merged');
          // Merge intervals if they are continuous
          currentEndTime = endTime;
        } else {
          // Push the merged interval to result and add it to the newEventSet
          const event = { ...defaultValuesObj, startTime: currentStartTime, endTime: currentEndTime };
          result.push(event);
          newEventSet.add(`${event.queue}-${event.startTime}-${event.endTime}`);

          // Start a new interval
          currentStartTime = startTime;
          currentEndTime = endTime;
        }
      }

      // Push the last interval and add it to the newEventSet
      const lastEvent = { ...defaultValuesObj, startTime: currentStartTime, endTime: currentEndTime };
      result.push(lastEvent);
      newEventSet.add(`${lastEvent.queue}-${lastEvent.startTime}-${lastEvent.endTime}`);

      return result;
    });

    // Filter out future events from existingEvents that are no longer in the new schedule
    const updatedEvents = existingEvents.filter((event) => {
      const eventStart = moment.tz(`${event.date}T${event.startTime}`, 'YYYY-MM-DDTHH:mm', 'Europe/Kyiv');

      // Keep events that have already started or are ongoing
      if (eventStart.isBefore(currentDateTime)) {
        return true;
      }

      // Remove events that are not in the new schedule and haven't started yet
      const eventKey = `${event.queue}-${event.startTime}-${event.endTime}`;
      return newEventSet.has(eventKey);
    });

    // Merge the filtered existing events with new events
    return [...updatedEvents, ...newEvents];
  };

  parseMessage = (message: string): IParsedTgMessage | null => {
    console.log('scv_msg', message);
    const targetDate: string | null = this.getTargetDate(message);
    console.log('scv_targetDate', targetDate);
    const parsedSchedule: ParsedScheduleString[] | null = this.parseSchedule(message);
    console.log('scv_parsedSchedule', parsedSchedule);
    if (!parsedSchedule || !targetDate) return null;

    const groupedByQueue: GroupByQueueResult = this.groupByQueue(parsedSchedule);
    console.log('scv_groupedByQueue', groupedByQueue);
    const eventsList: EoffEvent[] | void = this.convertToEvents(groupedByQueue, targetDate);
    // console.log('scv_eventlist', targetDate, eventsList);
    if (!eventsList || !targetDate) return null;
    return { targetDate, eventsList };
  };

  convertMessagesToEvents(messages: TotalList<Api.Message>): ISchedule {
    messages.forEach((message) => {
      if (message.message) {
        const parsedMessage: IParsedTgMessage | null = cherkoeTgParser.parseMessage(message.message);

        if (!parsedMessage?.targetDate) {
          return;
        }

        const targetDate = parsedMessage.targetDate;
        const newEvents = parsedMessage.eventsList || [];

        // If there's existing data for the date, merge with new data
        if (this.daysScheduleData[targetDate]) {
          const existingEvents = this.daysScheduleData[targetDate];
          this.daysScheduleData[targetDate] = this.updateEvents(existingEvents, newEvents);
        } else {
          this.daysScheduleData[targetDate] = newEvents;
        }
      }
    });

    const { todayDate, tomorrowDate } = getTodayAndTomorrowDate();
    console.log('scv_dates', todayDate, tomorrowDate);
    const result: ISchedule = {
      events: [],
      hasTodayData: false,
      hasTomorrowData: false,
    };

    // Filter events for today and tomorrow
    if (this.daysScheduleData[todayDate]) {
      result.events = [...this.daysScheduleData[todayDate]];
      result.hasTodayData = true;
    }

    if (this.daysScheduleData[tomorrowDate]) {
      result.events = [...result.events, ...this.daysScheduleData[tomorrowDate]];
      result.hasTomorrowData = true;
    }

    return result;
  }

  private updateEvents(existingEvents: EoffEvent[], newEvents: EoffEvent[]): EoffEvent[] {
    const updatedEventsMap = new Map<string, EoffEvent>();

    // Add existing events to map
    existingEvents.forEach((event) => {
      const key = `${event.startTime}-${event.endTime}-${event.queue}`;
      updatedEventsMap.set(key, { ...event });
    });
    console.log('scv_updatedEvents', updatedEventsMap);

    const timezone = 'Europe/Kiev'; // Adjust timezone as needed
    const now = getNewKyivDate();
    console.log('scv_now??', now);

    console.log('scv_newEvents', newEvents);
    // Update or add new events
    newEvents.forEach((event) => {
      console.log('event', event);
      const key = `${event.startTime}-${event.endTime}-${event.queue}`;
      console.log('scv_key', key);
      const existingEvent = updatedEventsMap.get(key);

      const eventStart = moment.tz(`${event.date} ${event.startTime}`, 'YYYY-MM-DD HH:mm', timezone);
      const eventEnd = moment.tz(`${event.date} ${event.endTime}`, 'YYYY-MM-DD HH:mm', timezone);

      if (existingEvent) {
        console.log('scv_existingEvent', existingEvent);
        // Update the event if it overlaps with the new event data
        if (eventStart.isSameOrBefore(now) && eventEnd.isSameOrAfter(now)) {
          // Adjust or update existing event based on new event data
          const existingEnd = moment.tz(`${event.date} ${existingEvent.endTime}`, 'YYYY-MM-DD HH:mm', timezone);
          const updatedEndTime = eventEnd.isAfter(existingEnd) ? event.endTime : existingEvent.endTime;
          updatedEventsMap.set(key, { ...existingEvent, endTime: updatedEndTime });
        }
      } else {
        console.log('scv_adding new event', key, event);
        // Add new event
        updatedEventsMap.set(key, event);
      }
    });

    // Convert map back to array
    return Array.from(updatedEventsMap.values());
  }

  private filterRelevantEvents(events: EoffEvent[], date: string): EoffEvent[] {
    const timezone = 'Europe/Kiev'; // Adjust timezone as needed
    const now = moment().tz(timezone); // Current time using moment
    return events.filter((event) => {
      const start = moment.tz(`${date} ${event.startTime}`, 'YYYY-MM-DD HH:mm', timezone);
      const end = moment.tz(`${date} ${event.endTime}`, 'YYYY-MM-DD HH:mm', timezone);
      return now.isSameOrBefore(end); // Include events that are still ongoing or upcoming
    });
  }

  private leaveOnlyPastEvents(events: EoffEvent[], timezone: string = 'Europe/Kiev'): EoffEvent[] {
    const now = moment().tz(timezone); // Get current time in the specified timezone

    return events.filter((event) => {
      // Create moment objects for event start and end time
      const eventStart = moment.tz(`${event.date} ${event.startTime}`, 'YYYY-MM-DD HH:mm', timezone);
      const eventEnd = moment.tz(`${event.date} ${event.endTime}`, 'YYYY-MM-DD HH:mm', timezone);

      // Keep the event only if it hasn't ended yet (i.e., eventEnd is after current time)
      return eventEnd.isBefore(now);
    });
  }
}

export const cherkoeTgParser = new CherkoeTgParser();
