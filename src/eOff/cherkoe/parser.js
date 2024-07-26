import { getCurrentMonth, getNextMonth, formatDateFromObject, getTodayDate } from './utils.js';
import config from '../../config.js';

/** typedef {Object} Target
 * @property {String} name
 * @property {Number} index
 * @property {Number} day
 *
 *
 * */

/**
 * @param {NewMessageEvent.message} message
 */
const getTargetDate = (message) => {
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
  const targetDay = parseInt(targetDayString.match(/\d+$/)[0]);

  return formatDateFromObject({ ...target, day: targetDay });
};

const parseQueueNumbers = (line) => {
  const splittedLine = line.split('00');
  return splittedLine[splittedLine.length - 1].match(/\d+/g);
};

const parseSchedule = (message) => {
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

  const offlineHours = [];

  filteredSchedule.forEach((line) => {
    const queues = parseQueueNumbers(line);
    const timeZoneIndex = line.split(':')[0];

    queues.forEach((queue) => {
      offlineHours.push({ queue, timeZoneIndex });
    });
  });

  return offlineHours;
};

// Function to convert timeZoneIndex to start and end hours
function indexToHours(timeZoneIndex) {
  const startHour = timeZoneIndex * 1; // 1 hour per timezoneIndex
  const endHour = startHour + 1; // Each timezoneIndex is 1 hour duration
  return {
    startHour: `${startHour.toString().padStart(2, '0')}:00`,
    endHour: `${endHour.toString().padStart(2, '0')}:00`,
  };
}

const groupByQueue = (data) =>
  data.reduce((acc, { queue, timeZoneIndex }) => {
    if (!acc[queue]) {
      acc[queue] = [];
    }
    acc[queue].push(timeZoneIndex);
    return acc;
  }, {});

const convertToEvents = (scheduleData, date) => {
  // Convert grouped data to events
  return Object.entries(scheduleData).flatMap(([queue, timeZones]) => {
    if (timeZones.length === 0) return [];

    timeZones.sort((a, b) => a - b); // Ensure the timeZones are sorted
    let currentStartIndex = parseInt(timeZones[0], 10);
    let currentEndIndex = parseInt(timeZones[0], 10);
    const result = [];

    const defaultValuesObj = { queue, date, electricity: 'off', provider: config.providerName };

    for (let i = 1; i < timeZones.length; i++) {
      const currentZone = parseInt(timeZones[i], 10);

      if (currentZone === currentEndIndex + 1) {
        currentEndIndex = currentZone;
      } else {
        const { startHour: startTime } = indexToHours(currentStartIndex);
        const { endHour: endTime } = indexToHours(currentEndIndex);
        result.push({ ...defaultValuesObj, startTime, endTime });

        currentStartIndex = currentZone;
        currentEndIndex = currentZone;
      }
    }

    // Add last range
    const { startHour: startTime } = indexToHours(currentStartIndex);
    const { endHour: endTime } = indexToHours(currentEndIndex);
    result.push({ ...defaultValuesObj, startTime, endTime });

    return result;
  });
};

/**
 * @typedef {Object} ElectricityEvent
 * @property {String} date example: '2024-07-26'
 * @property {String} electricity always 'off'
 * @property {String} startTime example: '22:00'
 * @property {String} endTime example: '22:00'
 * @property {String} provider example: 'CHERKOE'
 * @property {String} queue example: '1'
 */

/**
 * @typedef {Object} ParsedMessage
 * @property {String} targetDate example: '2024-07-26'
 * @property {Array<ElectricityEvent>} eventsList list with all parsed events
 */

/** Parse electricity events from telegram message
 * @param {NewMessageEvent.message} message
 * @returns ParsedMessage
 */

const parseMessage = (message) => {
  const targetDate = getTargetDate(message);

  const parsedSchedule = parseSchedule(message);

  if (!parsedSchedule) return null;

  const groupedByQueue = groupByQueue(parsedSchedule);

  const eventsList = convertToEvents(groupedByQueue, targetDate);

  return { targetDate, eventsList };
};

export { parseMessage, getTargetDate };
