import { TelegramClient } from 'telegram';
import config from '../../config';
import moment from 'moment-timezone';

export interface DateObj {
  year: number;
  name: string;
  index: number;
}

const KYIV_TIMEZONE = 'Europe/Kiev';

export const MONTH_NAMES: string[] = [
  'січня',
  'лютого',
  'березня',
  'квітня',
  'травня',
  'червня',
  'липня',
  'серпня',
  'вересня',
  'жовтня',
  'листопада',
  'грудня',
];

const getCurrentMonth = (): DateObj => {
  const currentDate = getNewKyivDate();
  const currentMonth = currentDate.month(); // Returns a number (0-11)

  return { index: currentMonth + 1, name: MONTH_NAMES[currentMonth], year: currentDate.year() };
};

const getNextMonth = (): DateObj => {
  const currentDate = getNewKyivDate();
  let nextMonthIndex = currentDate.month() + 1; // Increment to get next month
  const currentYear = currentDate.year();

  let year = currentYear;
  // Handle wrap around for December
  if (nextMonthIndex === 12) {
    nextMonthIndex = 0; // January (0 index)
    if (currentDate.date() === 31) {
      year = currentYear + 1;
    }
  }

  return { index: nextMonthIndex + 1, name: MONTH_NAMES[nextMonthIndex], year };
};

function formatDateFromObject(obj: { day: any; index: any; name?: string; year?: number }): string {
  console.log('scv_formatting_date', obj);
  const year = new Date().getFullYear(); // Get the current year
  const monthIndex = obj.index - 1; // Convert month index to zero-based
  const month = (monthIndex + 1).toString().padStart(2, '0'); // Convert to one-based index and pad to two digits
  const day = obj.day.toString().padStart(2, '0'); // Ensure day is two digits with leading zero if necessary

  // Create date string in YYYY-MM-DD format
  return `${year}-${month}-${day}`;
}

let tgClient: TelegramClient;

const getTelegramClient = async (): Promise<TelegramClient> => {
  if (tgClient) {
    return tgClient;
  }

  tgClient = new TelegramClient(config.telegram.stringSession, config.telegram.apiId, config.telegram.apiHash, {
    connectionRetries: 10,
    floodSleepThreshold: 0,
  });

  await tgClient.connect();

  return tgClient;
};

const getFormattedDate = (date: moment.Moment): string => {
  const year = date.year();
  const month = (date.month() + 1).toString().padStart(2, '0'); // Months are zero-based, so add 1
  const day = date.date().toString().padStart(2, '0'); // Day of the month
  return `${year}-${month}-${day}`;
};

// Get the current date and time in Kyiv timezone
const getNewKyivDate = (): moment.Moment => moment.tz('Europe/Kyiv');

const toKyivDate = (date: any): moment.Moment => moment.tz(date, KYIV_TIMEZONE);

const getTodayAndTomorrowDate = (): { todayDate: string; tomorrowDate: string } => {
  const today: moment.Moment = getNewKyivDate();
  const todayDate: string = getFormattedDate(today);

  const tomorrow: moment.Moment = today.clone().add(1, 'day');
  const tomorrowDate: string = getFormattedDate(tomorrow);

  return { todayDate, tomorrowDate };
};

export {
  getCurrentMonth,
  getNextMonth,
  formatDateFromObject,
  getTelegramClient,
  getFormattedDate,
  getNewKyivDate,
  toKyivDate,
  getTodayAndTomorrowDate,
};
