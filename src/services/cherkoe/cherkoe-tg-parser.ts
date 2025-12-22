import {
  convertToEvents,
  getTargetDate,
  getTodayAndTomorrowDate,
  groupByQueue,
  parseQueueNumbers,
} from '../../common/utils';
import { TotalList } from 'telegram/Helpers';
import { Api } from 'telegram';
import {
  ELECTRICITY_PROVIDER,
  GroupByQueueResult,
  IEoffEvent,
  IParsedMessage,
  ISchedule,
  ITargetDateObject,
  ParsedScheduleString,
} from '../../common/types-and-interfaces';

function getMessageTimeObjNow(messageTime: number): { dateStr: string; totalMinutes: number } {
  const time = new Date(messageTime);
  const tz = { timeZone: 'Europe/Kyiv' };

  const dateStr = time.toLocaleDateString('sv-SE', tz);
  const [h, m] = time.toLocaleTimeString('en-GB', tz).split(':');

  return { dateStr, totalMinutes: Number(h) * 60 + Number(m) };
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
      // AND no new event should overlap with this old event's time range
      if (startMinutes < currentTimeMinutes && endMinutes <= currentTimeMinutes) {
        // Check if any new event overlaps with this old event (same queue)
        const hasOverlappingNewEvent = newEvents.some((newEvent) => {
          if (newEvent.queue !== oldEvent.queue) return false;

          const newStartMinutes = timeToMinutes(newEvent.startTime);
          const newEndMinutes = timeToMinutes(newEvent.endTime);

          // Ranges overlap if: startA < endB AND startB < endA
          return startMinutes < newEndMinutes && newStartMinutes < endMinutes;
        });

        if (!hasOverlappingNewEvent) {
          eventsToPreserve.push(oldEvent);
        }
      }
    }
  }
  console.log('scv_before_result', eventsToPreserve, newEvents);
  // Combine preserved old events with all new events
  return [...eventsToPreserve, ...newEvents];
}

export class CherkoeTgParser {
  private daysScheduleData: { [index: string]: IEoffEvent[] } = {};
  private provider: ELECTRICITY_PROVIDER = ELECTRICITY_PROVIDER.CHERKOE;

  private parseSchedule = (message: string): ParsedScheduleString[] | null => {
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
    console.log('scv_filteredLines', filteredLines);

    console.log('scv_filteredSchedule', filteredLines);
    const offlineHours: ParsedScheduleString[] = [];

    filteredLines.forEach((line) => {
      console.log('scv_parsing_line', line);
      const queues: string[] | null = parseQueueNumbers(line);
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

  parseMessage = (message: string): IParsedMessage | null => {
    const targetDateResult: null | ITargetDateObject = getTargetDate(message);
    if (!targetDateResult) return null;
    const { targetDate, rawDateObj } = targetDateResult;
    console.log('scv_TargetDate', targetDate);
    const parsedSchedule: ParsedScheduleString[] | null = this.parseSchedule(message);
    console.log('scv_parsedSchedule', parsedSchedule);
    if (!parsedSchedule) return null;

    const groupedByQueue: GroupByQueueResult = groupByQueue(parsedSchedule);
    console.log('scv_groupedByQueue', groupedByQueue);
    const eventsList: IEoffEvent[] | void = convertToEvents(groupedByQueue, targetDate, this.provider);
    console.log('scv_eventsList', eventsList);
    if (!eventsList) return null;
    return { targetDate, eventsList };
  };

  convertMessagesToEvents(messages: TotalList<Api.Message>): ISchedule {
    messages.forEach((message) => {
      if (message.message) {
        const parsedMessage: IParsedMessage | null = cherkoeTgParser.parseMessage(message.message);

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
