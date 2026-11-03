import { IQueueStatus, QUEUE_STATUS } from './types-and-interfaces';
import { getFormattedDate, toKyivDate } from './utils';

// Emergency cutoffs (ГАВ) are announced region-wide, without queues or end time.
// Since late 2025 providers don't post cancellations anymore, so an announcement is valid
// until the end of its (Kyiv) day, unless a cancellation is posted the same day.

export type EmergencyEvent = 'apply' | 'cancel';

export interface IChannelMessage {
  date: number; // unix seconds
  message: string;
}

export const QUEUES: string[] = ['1', '2', '3', '4', '5', '6'].flatMap((q) => [`${q}.1`, `${q}.2`]);

// "застосовані графіки аварійних відключень", "введено графіки аварійних", "застосовуються аварійні відключення"...
const APPLY_REGEX = /(застосован|застосовуют|застосовуватим|введен|запровадж)\S*[^.]{0,60}аварійн\S*\s+(відключ|вимкн)/iu;

// ponytail: length heuristic - real announcements are <= ~750 chars, explainer articles
// ("вже кілька днів поспіль застосовуються ГАВ...") are 1000+. Revisit if announcements grow.
const MAX_ANNOUNCEMENT_LENGTH = 1000;

// "скасовано графіки аварійних", "графіки аварійних відключень скасовано", "ГАВ ... не застосовуються",
// "графіки аварійних відключень замінено на графіки погодинних"
const CANCEL_REGEX =
  /скасован\S*[^.]{0,60}аварійн|аварійн\S*\s+(відключ|вимкн)\S*[^.]{0,60}скасован|аварійн[^.]{0,60}не застосовуються|аварійн\S*\s+(відключень|вимкнень)\s+замінено/iu;

// Boilerplate in apply posts: "Аварійні відключення будуть скасовані після стабілізації..."
const FUTURE_CANCEL_REGEX = /будуть скасован/iu;

export const detectEmergency = (text: string): EmergencyEvent | null => {
  const lines = (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.some((line) => CANCEL_REGEX.test(line) && !FUTURE_CANCEL_REGEX.test(line))) return 'cancel';

  // Whole text, not only the headline: Kharkiv sometimes puts it mid-post ("Крім того, зараз застосовуються ГАВ")
  if (text.length <= MAX_ANNOUNCEMENT_LENGTH && lines.some((line) => APPLY_REGEX.test(line))) return 'apply';

  return null;
};

export const isEmergencyActiveToday = (messages: IChannelMessage[], todayDate: string): boolean =>
  [...messages]
    .filter((m) => m.message && getFormattedDate(toKyivDate(m.date * 1000)) === todayDate)
    .sort((a, b) => a.date - b.date)
    .reduce((active, m) => {
      const event = detectEmergency(m.message);
      return event ? event === 'apply' : active;
    }, false);

const scheduleStatus = (hasData: boolean): QUEUE_STATUS => (hasData ? QUEUE_STATUS.APPLIES : QUEUE_STATUS.WAITING);

export const buildQueueStatuses = (
  hasTodayData: boolean,
  hasTomorrowData: boolean,
  emergencyToday: boolean
): IQueueStatus[] =>
  QUEUES.map((queue) => ({
    queue,
    todayStatus: emergencyToday ? QUEUE_STATUS.EMERGENCY : scheduleStatus(hasTodayData),
    tomorrowStatus: scheduleStatus(hasTomorrowData),
  }));
