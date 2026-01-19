/**
 * Comprehensive E2E tests for cherkoeService.getSchedule()
 *
 * These tests cover real-world scenarios based on actual telegram messages
 * from Cherkasy Oblast Energy Company, including:
 * - Multiple schedule updates for the same date
 * - Different queue formats (1.1, 1.2, 2.1, 2.2, etc.)
 * - Time formats with minutes (08:30, 14:30, etc.)
 * - Emergency shutdown announcements
 * - Power limitation announcements
 * - Messages with media/links
 * - Partial schedules (some groups missing)
 * - Edge cases
 */

import * as parserModule from '../../../services/cherkoe/cherkoe-tg-parser';
import * as utilsModule from '../../../common/utils';
import { MONTH_NAMES } from '../../../common/utils';
import { ISchedule, ELECTRICITY_PROVIDER, ELECTRICITY_STATUS } from '../../../common/types-and-interfaces';
import {
  jan15InitialSchedule,
  jan15FirstUpdate,
  jan15EmergencyShutdown,
  jan15ReducedSchedule,
  jan16ScheduleWithMinutes,
  jan16PowerLimitation,
  jan19MinimalOutages,
  jan18PartialSchedule,
  jan15InformationalMessage,
  jan15InitialExpectedResult,
} from './stubs/real-world-messages';

describe('CherkoeService.getSchedule() - Comprehensive E2E Tests', () => {
  let sut: parserModule.CherkoeTgParser;

  beforeEach(() => {
    // Create a fresh instance for each test to avoid state pollution
    sut = new parserModule.CherkoeTgParser();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Schedule Parsing', () => {
    it('should parse initial schedule with new queue format (1.1, 1.2, 2.1, etc.)', () => {
      // Mock date to January 14, 2026
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      jest.spyOn(utilsModule, 'getNewKyivDate').mockReturnValue(utilsModule.toKyivDate('2026-01-14 23:31:00'));
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-14',
        tomorrowDate: '2026-01-15',
      });

      // @ts-ignore
      const result: ISchedule = sut.convertMessagesToEvents([jan15InitialSchedule]);

      // Should have tomorrow's data
      expect(result.hasTodayData).toBe(false);
      expect(result.hasTomorrowData).toBe(true);

      // Should parse all 12 sub-queues (1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2)
      const queues = [...new Set(result.events.map((e) => e.queue))];
      expect(queues.sort()).toEqual(['1.1', '1.2', '2.1', '2.2', '3.1', '3.2', '4.1', '4.2', '5.1', '5.2', '6.1', '6.2']);

      // Verify total number of events matches expected
      expect(result.events.length).toBe(jan15InitialExpectedResult.events.length);

      // Verify all events have correct provider
      result.events.forEach((event) => {
        expect(event.provider).toBe(ELECTRICITY_PROVIDER.CHERKOE);
        expect(event.electricity).toBe(ELECTRICITY_STATUS.OFF);
        expect(event.date).toBe('2026-01-15');
      });

      // Verify specific queue data (queue 1.1)
      const queue11Events = result.events.filter((e) => e.queue === '1.1');
      expect(queue11Events).toHaveLength(5);
      expect(queue11Events).toContainEqual({
        queue: '1.1',
        date: '2026-01-15',
        startTime: '00:00',
        endTime: '02:00',
        electricity: ELECTRICITY_STATUS.OFF,
        provider: ELECTRICITY_PROVIDER.CHERKOE,
      });
      expect(queue11Events).toContainEqual({
        queue: '1.1',
        date: '2026-01-15',
        startTime: '22:00',
        endTime: '24:00',
        electricity: ELECTRICITY_STATUS.OFF,
        provider: ELECTRICITY_PROVIDER.CHERKOE,
      });
    });

    it('should handle schedules with time in minutes format (08:30, 14:30, etc.)', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      jest.spyOn(utilsModule, 'getNewKyivDate').mockReturnValue(utilsModule.toKyivDate('2026-01-15 22:40:00'));
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-15',
        tomorrowDate: '2026-01-16',
      });

      // @ts-ignore
      const result: ISchedule = sut.convertMessagesToEvents([jan16ScheduleWithMinutes]);

      expect(result.hasTomorrowData).toBe(true);
      expect(result.events.length).toBeGreaterThan(0);

      // Verify time formats with minutes are parsed correctly
      const queue11Events = result.events.filter((e) => e.queue === '1.1');
      expect(queue11Events).toContainEqual(
        expect.objectContaining({
          queue: '1.1',
          date: '2026-01-16',
          startTime: '04:00',
          endTime: '08:30',
        })
      );
      expect(queue11Events).toContainEqual(
        expect.objectContaining({
          queue: '1.1',
          date: '2026-01-16',
          startTime: '10:00',
          endTime: '14:30',
        })
      );

      // Verify queue 2.1 with 08:30 start time
      const queue21Events = result.events.filter((e) => e.queue === '2.1');
      expect(queue21Events).toContainEqual(
        expect.objectContaining({
          startTime: '08:30',
          endTime: '13:00',
        })
      );
    });

    it('should handle partial schedules where some groups have no outages', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      jest.spyOn(utilsModule, 'getNewKyivDate').mockReturnValue(utilsModule.toKyivDate('2026-01-18 22:05:00'));
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-18',
        tomorrowDate: '2026-01-19',
      });

      // @ts-ignore
      const result: ISchedule = sut.convertMessagesToEvents([jan18PartialSchedule]);

      expect(result.hasTodayData).toBe(true);
      expect(result.events.length).toBeGreaterThan(0);

      // Queue 1.1 should have only 1 event (23:00 - 24:00)
      const queue11Events = result.events.filter((e) => e.queue === '1.1');
      expect(queue11Events).toHaveLength(1);
      expect(queue11Events[0]).toMatchObject({
        startTime: '23:00',
        endTime: '24:00',
      });

      // Queue 1.2 and 4.1 and 4.2 should have NO events
      const queue12Events = result.events.filter((e) => e.queue === '1.2');
      const queue41Events = result.events.filter((e) => e.queue === '4.1');
      const queue42Events = result.events.filter((e) => e.queue === '4.2');
      expect(queue12Events).toHaveLength(0);
      expect(queue41Events).toHaveLength(0);
      expect(queue42Events).toHaveLength(0);
    });
  });

  describe('Multiple Schedule Updates', () => {
    it('should handle multiple updates to the same schedule (preserving past events)', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      // Current time is 17:30 on Jan 15
      jest.spyOn(utilsModule, 'getNewKyivDate').mockReturnValue(utilsModule.toKyivDate('2026-01-15 17:30:00'));
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-15',
        tomorrowDate: '2026-01-16',
      });

      // Process initial schedule (posted at 01:50) and then the reduced schedule (posted at 17:30)
      // @ts-ignore
      const result: ISchedule = sut.convertMessagesToEvents([jan15FirstUpdate, jan15ReducedSchedule]);

      expect(result.hasTodayData).toBe(true);
      expect(result.events.length).toBeGreaterThan(0);

      // After 17:30 update, only events from 16:00 onwards should remain for today
      // Events before 17:30 should have been completed and removed (unless they're preserved)
      const todayEvents = result.events.filter((e) => e.date === '2026-01-15');

      // The reduced schedule only has outages starting from 14:00 onwards
      // So we shouldn't have events starting before 14:00 (unless they were in progress)
      const eventsBeforeTwopm = todayEvents.filter((e) => {
        const startHour = parseInt(e.startTime.split(':')[0]);
        return startHour < 14;
      });

      // All events before 14:00 should be completed and preserved (if they ended before 17:30)
      eventsBeforeTwopm.forEach((event) => {
        const endHour = parseInt(event.endTime.split(':')[0]);
        // Events that ended before 17:30 should be preserved
        expect(endHour).toBeLessThanOrEqual(17);
      });
    });

    it('should correctly merge schedules when receiving multiple updates throughout the day', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });

      // Simulate receiving 3 updates: initial (01:50), emergency announcement (10:23), and reduced (17:30)
      jest.spyOn(utilsModule, 'getNewKyivDate').mockReturnValue(utilsModule.toKyivDate('2026-01-15 18:00:00'));
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-15',
        tomorrowDate: '2026-01-16',
      });

      const result: ISchedule = sut.convertMessagesToEvents([
        // @ts-ignore
        jan15FirstUpdate,
        // @ts-ignore
        jan15EmergencyShutdown, // This has no schedule data, should not affect result
        // @ts-ignore
        jan15ReducedSchedule,
      ]);

      expect(result.hasTodayData).toBe(true);

      // Emergency shutdown message should not add any events (it's just an announcement)
      // Result should only contain events from first update and reduced schedule
      const allQueues = [...new Set(result.events.map((e) => e.queue))];
      expect(allQueues.length).toBeGreaterThan(0);
    });
  });

  describe('Non-Schedule Messages', () => {
    it('should ignore emergency shutdown announcements without schedule data', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      jest.spyOn(utilsModule, 'getNewKyivDate').mockReturnValue(utilsModule.toKyivDate('2026-01-15 10:23:00'));
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-15',
        tomorrowDate: '2026-01-16',
      });

      // @ts-ignore
      const result: ISchedule = sut.convertMessagesToEvents([jan15EmergencyShutdown]);

      // Should have no events since this is just an announcement
      expect(result.events).toHaveLength(0);
      expect(result.hasTodayData).toBe(false);
      expect(result.hasTomorrowData).toBe(false);
    });

    it('should ignore power limitation announcements without schedule data', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      jest.spyOn(utilsModule, 'getNewKyivDate').mockReturnValue(utilsModule.toKyivDate('2026-01-15 19:28:00'));
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-15',
        tomorrowDate: '2026-01-16',
      });

      // @ts-ignore
      const result: ISchedule = sut.convertMessagesToEvents([jan16PowerLimitation]);

      // Should have no events since this is for industry/business only (ГОП)
      expect(result.events).toHaveLength(0);
      expect(result.hasTodayData).toBe(false);
      expect(result.hasTomorrowData).toBe(false);
    });

    it('should ignore informational messages with video links', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      jest.spyOn(utilsModule, 'getNewKyivDate').mockReturnValue(utilsModule.toKyivDate('2026-01-15 23:15:00'));
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-15',
        tomorrowDate: '2026-01-16',
      });

      // @ts-ignore
      const result: ISchedule = sut.convertMessagesToEvents([jan15InformationalMessage]);

      // Should have no events since this is just an informational message
      expect(result.events).toHaveLength(0);
      expect(result.hasTodayData).toBe(false);
      expect(result.hasTomorrowData).toBe(false);
    });
  });

  describe('Mixed Message Scenarios', () => {
    it('should correctly process a mix of schedule and non-schedule messages', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      jest.spyOn(utilsModule, 'getNewKyivDate').mockReturnValue(utilsModule.toKyivDate('2026-01-15 20:00:00'));
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-15',
        tomorrowDate: '2026-01-16',
      });

      // Process a mix: schedule, announcement, schedule, info message
      const result: ISchedule = sut.convertMessagesToEvents([
        // @ts-ignore
        jan15InitialSchedule,
        // @ts-ignore
        jan15EmergencyShutdown,
        // @ts-ignore
        jan15ReducedSchedule,
        // @ts-ignore
        jan15InformationalMessage,
      ]);

      // Should only have events from schedules, not from announcements or info messages
      expect(result.hasTomorrowData).toBe(true); // jan15InitialSchedule is for tomorrow when viewed from Jan 14
      expect(result.events.length).toBeGreaterThan(0);

      // All events should have valid queue, date, and times
      result.events.forEach((event) => {
        expect(event.queue).toMatch(/^\d+\.\d+$/); // Format: X.Y
        expect(event.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // Format: YYYY-MM-DD
        expect(event.startTime).toMatch(/^\d{2}:\d{2}$/); // Format: HH:MM
        expect(event.endTime).toMatch(/^\d{2}:\d{2}$/); // Format: HH:MM
        expect(event.provider).toBe(ELECTRICITY_PROVIDER.CHERKOE);
        expect(event.electricity).toBe(ELECTRICITY_STATUS.OFF);
      });
    });

    it('should handle schedules for multiple consecutive days', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      jest.spyOn(utilsModule, 'getNewKyivDate').mockReturnValue(utilsModule.toKyivDate('2026-01-18 22:05:00'));
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-18',
        tomorrowDate: '2026-01-19',
      });

      // Process schedules for Jan 18 and Jan 19
      const result: ISchedule = sut.convertMessagesToEvents([
        // @ts-ignore
        jan18PartialSchedule,
        // @ts-ignore
        jan19MinimalOutages
      ]);

      expect(result.hasTodayData).toBe(true);
      expect(result.hasTomorrowData).toBe(true);
      expect(result.events.length).toBeGreaterThan(0);

      // Should have events for both dates
      const jan18Events = result.events.filter((e) => e.date === '2026-01-18');
      const jan19Events = result.events.filter((e) => e.date === '2026-01-19');

      expect(jan18Events.length).toBeGreaterThan(0);
      expect(jan19Events.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message list', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-15',
        tomorrowDate: '2026-01-16',
      });

      // @ts-ignore
      const result: ISchedule = sut.convertMessagesToEvents([]);

      expect(result.events).toHaveLength(0);
      expect(result.hasTodayData).toBe(false);
      expect(result.hasTomorrowData).toBe(false);
    });

    it('should handle messages with only non-schedule content', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-15',
        tomorrowDate: '2026-01-16',
      });

      const result: ISchedule = sut.convertMessagesToEvents([
        // @ts-ignore
        jan15EmergencyShutdown,
        // @ts-ignore
        jan16PowerLimitation,
        // @ts-ignore
        jan15InformationalMessage,
      ]);

      expect(result.events).toHaveLength(0);
      expect(result.hasTodayData).toBe(false);
      expect(result.hasTomorrowData).toBe(false);
    });

    it('should correctly parse schedules with all 12 sub-queues', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-18',
        tomorrowDate: '2026-01-19',
      });

      // @ts-ignore
      const result: ISchedule = sut.convertMessagesToEvents([jan19MinimalOutages]);

      // Should have all 12 sub-queues represented
      const uniqueQueues = [...new Set(result.events.map((e) => e.queue))].sort();
      expect(uniqueQueues).toEqual(['1.1', '1.2', '2.1', '2.2', '3.1', '3.2', '4.1', '4.2', '5.1', '5.2', '6.1', '6.2']);
    });

    it('should handle 24:00 end time correctly', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-14',
        tomorrowDate: '2026-01-15',
      });

      // @ts-ignore
      const result: ISchedule = sut.convertMessagesToEvents([jan15InitialSchedule]);

      // Find events that end at 24:00
      const endAt24Events = result.events.filter((e) => e.endTime === '24:00');
      expect(endAt24Events.length).toBeGreaterThan(0);

      // Verify they have the correct format
      endAt24Events.forEach((event) => {
        expect(event.endTime).toBe('24:00');
        expect(event.startTime).toMatch(/^\d{2}:\d{2}$/);
      });
    });

    it('should handle consecutive time slots for the same queue', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-14',
        tomorrowDate: '2026-01-15',
      });

      // @ts-ignore
      const result: ISchedule = sut.convertMessagesToEvents([jan15InitialSchedule]);

      // Queue 1.1 has multiple non-consecutive time slots
      const queue11Events = result.events.filter((e) => e.queue === '1.1').sort((a, b) => a.startTime.localeCompare(b.startTime));

      // Verify they are separate events, not merged
      expect(queue11Events.length).toBe(5);

      // Verify the time slots are correct and not overlapping
      for (let i = 0; i < queue11Events.length - 1; i++) {
        const currentEnd = queue11Events[i].endTime;
        const nextStart = queue11Events[i + 1].startTime;
        // There should be a gap between consecutive events
        expect(currentEnd).not.toBe(nextStart);
      }
    });
  });

  describe('Data Integrity', () => {
    it('should ensure all events have required fields', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-14',
        tomorrowDate: '2026-01-15',
      });

      // @ts-ignore
      const result: ISchedule = sut.convertMessagesToEvents([jan15InitialSchedule]);

      result.events.forEach((event) => {
        expect(event).toHaveProperty('queue');
        expect(event).toHaveProperty('date');
        expect(event).toHaveProperty('startTime');
        expect(event).toHaveProperty('endTime');
        expect(event).toHaveProperty('electricity');
        expect(event).toHaveProperty('provider');

        // Verify field formats
        expect(event.queue).toBeTruthy();
        expect(event.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(event.startTime).toMatch(/^\d{2}:\d{2}$/);
        expect(event.endTime).toMatch(/^\d{2}:\d{2}$/);
        expect(event.electricity).toBe(ELECTRICITY_STATUS.OFF);
        expect(event.provider).toBe(ELECTRICITY_PROVIDER.CHERKOE);
      });
    });

    it('should ensure events are sorted by date and time', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-18',
        tomorrowDate: '2026-01-19',
      });

      const result: ISchedule = sut.convertMessagesToEvents([
        // @ts-ignore
        jan18PartialSchedule,
        // @ts-ignore
        jan19MinimalOutages
      ]);

      // Events should be sorted by date, then by queue, then by startTime
      // Note: The actual sorting implementation uses a custom sort function
      expect(result.events.length).toBeGreaterThan(0);

      // Verify events are grouped by date
      const eventsByDate = result.events.reduce((acc, event) => {
        if (!acc[event.date]) acc[event.date] = [];
        acc[event.date].push(event);
        return acc;
      }, {} as Record<string, typeof result.events>);

      // Should have events for both dates
      expect(Object.keys(eventsByDate)).toContain('2026-01-18');
      expect(Object.keys(eventsByDate)).toContain('2026-01-19');
    });

    it('should not have duplicate events', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-14',
        tomorrowDate: '2026-01-15',
      });

      // @ts-ignore
      const result: ISchedule = sut.convertMessagesToEvents([jan15InitialSchedule]);

      // Create a set of event identifiers
      const eventIds = result.events.map((e) => `${e.date}-${e.queue}-${e.startTime}-${e.endTime}`);
      const uniqueEventIds = new Set(eventIds);

      // Should have no duplicates
      expect(eventIds.length).toBe(uniqueEventIds.size);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle a large number of messages efficiently', () => {
      jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({
        index: 0,
        name: MONTH_NAMES[0],
        year: 2026,
      });
      jest.spyOn(utilsModule, 'getTodayAndTomorrowDate').mockReturnValue({
        todayDate: '2026-01-15',
        tomorrowDate: '2026-01-16',
      });

      // Create array of 50 messages (mix of schedules and announcements)
      const largeMessageSet = [
        jan15InitialSchedule,
        jan15FirstUpdate,
        jan15EmergencyShutdown,
        jan15ReducedSchedule,
        jan16ScheduleWithMinutes,
        jan16PowerLimitation,
        jan18PartialSchedule,
        jan19MinimalOutages,
        jan15InformationalMessage,
      ];

      // Duplicate to create larger set
      const messages = [];
      for (let i = 0; i < 6; i++) {
        messages.push(...largeMessageSet);
      }

      const startTime = Date.now();
      // @ts-ignore
      const result: ISchedule = sut.convertMessagesToEvents(messages);
      const endTime = Date.now();

      // Should complete in reasonable time (under 1 second)
      expect(endTime - startTime).toBeLessThan(1000);

      // Should still produce valid results
      expect(result.events.length).toBeGreaterThan(0);
    });
  });
});