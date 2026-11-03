import { KhoeParser } from '../../../services/khoe/khoe-parser';
import { khoeApi } from '../../../services/khoe/khoe-api';
import { khoeService } from '../../../services/khoe/khoe';
import * as telegramModule from '../../../common/telegram';
import { KhoeNewsItem, QUEUE_STATUS } from '../../../common/types-and-interfaces';
import * as stubs from '../../stubs/emergency-messages';

// Website news for 3 Nov with the same schedule Kharkivoblenergo posted to Telegram (#2300)
const scheduleLines = khoeApi.extractScheduleLines(stubs.khoeSchedule3Nov.message);
const news3Nov: KhoeNewsItem = {
  title: 'У Харківській області 3 листопада діятимуть погодинні відключення',
  url: '/uk/node/13883447',
  text: scheduleLines,
  targetDate: { targetDate: '2026-11-03', rawDateObj: { day: 3, year: 2026, name: 'листопада', index: 11 } },
};

const statuses = (queueStatuses: { todayStatus: string; tomorrowStatus: string }[]) => [
  ...new Set(queueStatuses.map((s) => `${s.todayStatus}/${s.tomorrowStatus}`)),
];

describe('Kharkiv emergency cutoffs (ГАВ)', () => {
  beforeEach(() => jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] }).setSystemTime(new Date('2026-11-03T11:00:00Z'))); // 13:00 Kyiv
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('KhoeParser.convertNewsToEvents', () => {
    it('flags today as EmergencyOff and keeps the hourly schedule in events', () => {
      const result = new KhoeParser().convertNewsToEvents([news3Nov], [stubs.khoeApply2Nov, stubs.khoeApply3Nov]);
      const withoutEmergency = new KhoeParser().convertNewsToEvents([news3Nov]);

      expect(scheduleLines).toHaveLength(12);
      expect(statuses(result.queueStatuses)).toEqual([`${QUEUE_STATUS.EMERGENCY}/${QUEUE_STATUS.WAITING}`]);
      expect(result.hasTodayData).toBe(true);
      expect(result.events).toEqual(withoutEmergency.events);
      expect(result.events).toContainEqual(
        expect.objectContaining({ queue: '2.1', date: '2026-11-03', startTime: '15:30', endTime: '22:00' })
      );
    });

    it('uses schedule statuses when there is no emergency post', () => {
      expect(statuses(new KhoeParser().convertNewsToEvents([news3Nov]).queueStatuses)).toEqual([
        `${QUEUE_STATUS.APPLIES}/${QUEUE_STATUS.WAITING}`,
      ]);
      // yesterday's announcement doesn't count
      expect(statuses(new KhoeParser().convertNewsToEvents([news3Nov], [stubs.khoeApply2Nov]).queueStatuses)).toEqual([
        `${QUEUE_STATUS.APPLIES}/${QUEUE_STATUS.WAITING}`,
      ]);
    });

    it('returns EmergencyOff even before the schedule is published', () => {
      const result = new KhoeParser().convertNewsToEvents([], [stubs.khoeApply3Nov]);

      expect(result.events).toEqual([]);
      expect(statuses(result.queueStatuses)).toEqual([`${QUEUE_STATUS.EMERGENCY}/${QUEUE_STATUS.WAITING}`]);
    });
  });

  describe('KhoeService.getSchedule', () => {
    beforeEach(() => {
      jest.spyOn(khoeApi, 'fetchAllNewsHeaders').mockResolvedValue([{ title: news3Nov.title, url: news3Nov.url }]);
      jest
        .spyOn(khoeApi, 'injectNewsDetails')
        .mockImplementation(async (news) => news.map((item) => ({ ...item, text: scheduleLines })));
    });

    it('reads emergency posts from the Kharkiv Telegram channel', async () => {
      const spy = jest.spyOn(telegramModule, 'getChannelMessages').mockResolvedValue([stubs.khoeApply3Nov] as any);

      const result = await khoeService.getSchedule();

      expect(spy).toHaveBeenCalledWith('kharkivenergy');
      expect(result.events.length).toBeGreaterThan(0);
      expect(statuses(result.queueStatuses)).toEqual([`${QUEUE_STATUS.EMERGENCY}/${QUEUE_STATUS.WAITING}`]);
    });

    it('still returns the schedule when Telegram is unavailable', async () => {
      jest.spyOn(telegramModule, 'getChannelMessages').mockRejectedValue(new Error('Telegram is down'));

      const result = await khoeService.getSchedule();

      expect(result.hasTodayData).toBe(true);
      expect(result.events.length).toBeGreaterThan(0);
      expect(statuses(result.queueStatuses)).toEqual([`${QUEUE_STATUS.APPLIES}/${QUEUE_STATUS.WAITING}`]);
    });
  });
});
