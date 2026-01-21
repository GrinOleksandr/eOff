import {
  convertToEvents,
  getTargetDate,
  getTodayAndTomorrowDate,
  groupByQueue,
  parseQueueNumbers,
  sortOutputEvents,
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

  try {
    // Try to use Kyiv timezone
    const tz = { timeZone: 'Europe/Kyiv' };
    const dateStr = time.toLocaleDateString('sv-SE', tz);
    const [h, m] = time.toLocaleTimeString('en-GB', tz).split(':');

    return { dateStr, totalMinutes: Number(h) * 60 + Number(m) };
  } catch (error) {
    // Fallback: Calculate Kyiv time manually with DST detection
    // Ukraine observes DST: UTC+2 (winter) / UTC+3 (summer)
    console.warn('Kyiv timezone not available, using UTC+2/+3 fallback with DST detection');

    // Detect DST using a reference date
    // DST in Ukraine: last Sunday of March 03:00 → last Sunday of October 04:00
    const isDST = isDaylightSavingTime(time);
    const kyivOffsetHours = isDST ? 3 : 2; // UTC+3 in summer, UTC+2 in winter
    const kyivOffsetMs = kyivOffsetHours * 60 * 60 * 1000;

    const kyivTime = new Date(time.getTime() + kyivOffsetMs);

    // Get Kyiv local time components
    const totalMinutes = kyivTime.getUTCHours() * 60 + kyivTime.getUTCMinutes();

    // Format date in YYYY-MM-DD
    const year = kyivTime.getUTCFullYear();
    const month = String(kyivTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(kyivTime.getUTCDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    return { dateStr, totalMinutes };
  }
}

// Helper function to detect if DST is active for a given date
function isDaylightSavingTime(date: Date): boolean {
  // Ukraine DST rules (European Union rules):
  // Starts: Last Sunday of March at 03:00
  // Ends: Last Sunday of October at 04:00

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth(); // 0-11

  // DST is active from April to September (definitely)
  if (month >= 3 && month <= 8) {
    return true; // April - September
  }

  // DST is NOT active from November to February (definitely)
  if (month <= 1 || month >= 10) {
    return false; // November - February
  }

  // March and October need careful checking
  if (month === 2) {
    // March: DST starts last Sunday at 03:00 UTC
    const lastSunday = getLastSundayOfMonth(year, 2);
    const dstStart = new Date(Date.UTC(year, 2, lastSunday, 1, 0, 0)); // 03:00 local = 01:00 UTC
    return date >= dstStart;
  }

  if (month === 9) {
    // October: DST ends last Sunday at 04:00 local (01:00 UTC before transition)
    const lastSunday = getLastSundayOfMonth(year, 9);
    const dstEnd = new Date(Date.UTC(year, 9, lastSunday, 1, 0, 0)); // 04:00 local = 01:00 UTC
    return date < dstEnd;
  }

  return false;
}

// Get the last Sunday of a given month
function getLastSundayOfMonth(year: number, month: number): number {
  // Start from the last day of the month
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  const lastDayNum = lastDay.getUTCDate();
  const lastDayOfWeek = lastDay.getUTCDay();

  // Calculate days to subtract to get to Sunday (0)
  const daysToSubtract = lastDayOfWeek === 0 ? 0 : lastDayOfWeek;

  return lastDayNum - daysToSubtract;
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
  existingEvents: IEoffEvent[],
  newEvents: IEoffEvent[],
  targetDate: string,
  messageTime: number
): IEoffEvent[] {
  // Validate message timestamp - reject messages older than 48 hours
  // Note: Allows future messages (for testing or clock skew)
  // Can be disabled in tests by setting SKIP_MESSAGE_TIMESTAMP_VALIDATION=true
  const SKIP_VALIDATION = process.env.SKIP_MESSAGE_TIMESTAMP_VALIDATION === 'true' || process.env.NODE_ENV === 'test';

  if (!SKIP_VALIDATION) {
    const messageAge = Date.now() - messageTime;
    const MAX_MESSAGE_AGE = 72 * 60 * 60 * 1000; // 48 hours in milliseconds

    if (messageAge > MAX_MESSAGE_AGE && messageAge > 0) {
      // Only reject if message is in the PAST (negative messageAge means future, which is OK)
      console.warn(
        `Ignoring stale message from ${new Date(messageTime).toISOString()}. ` +
          `Message is ${Math.round(messageAge / (60 * 60 * 1000))} hours old.`
      );
      return existingEvents; // Keep existing data, ignore stale update
    }
  }

  if (!newEvents?.length) {
    return existingEvents;
  }

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

      // IMPORTANT: Only preserve events that have COMPLETELY FINISHED
      // Ongoing or future events from old schedule are NEVER preserved
      // This ensures new schedule always takes priority for current/future events
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

    const offlineHours: ParsedScheduleString[] = [];

    filteredLines.forEach((line) => {
      const queues: string[] | null = parseQueueNumbers(line);

      const allTimeMatches = [...line.matchAll(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/g)];

      if (!queues || !allTimeMatches?.length) return;

      queues.forEach((queue) => {
        allTimeMatches.forEach((timeMatch) => {
          let [_, startTime, endTime] = timeMatch;

          // Only convert 00: to 24: if startTime is not also 00: (to handle midnight crossing)
          if (endTime.startsWith('00:') && !startTime.startsWith('00:')) {
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

    result.events.sort(sortOutputEvents);

    console.log('scv_final_res', result);
    return result;
  }
}

export const cherkoeTgParser = new CherkoeTgParser();
