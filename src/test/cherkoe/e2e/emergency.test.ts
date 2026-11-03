import { CherkoeTgParser } from '../../../services/cherkoe/cherkoe-tg-parser';
import { ISchedule, QUEUE_STATUS } from '../../../common/types-and-interfaces';
import { IChannelMessage } from '../../../common/emergency';
import * as stubs from '../../stubs/emergency-messages';

// Real 2-3 Nov 2026 sequence from t.me/pat_cherkasyoblenergo
const nov2 = [stubs.cherkoeApply2Nov, stubs.cherkoeExplainer2Nov, stubs.cherkoePowerLimit3Nov, stubs.cherkoeSchedule3Nov];
const nov3 = [...nov2, stubs.cherkoeScheduleUpdate3Nov, stubs.cherkoeApply3Nov];

const convert = (messages: IChannelMessage[]): ISchedule =>
  // @ts-ignore - parser only reads date and message
  new CherkoeTgParser().convertMessagesToEvents(messages);

const statuses = (schedule: ISchedule) => [
  ...new Set(schedule.queueStatuses.map((s) => `${s.todayStatus}/${s.tomorrowStatus}`)),
];

describe('Cherkasy emergency cutoffs (ГАВ)', () => {
  afterEach(() => jest.useRealTimers());

  it('flags today as EmergencyOff and keeps the hourly schedule in events', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-03T08:00:00Z')); // 10:00 Kyiv

    const result = convert(nov3);
    const withoutEmergency = convert(nov3.filter((m) => m !== stubs.cherkoeApply3Nov));

    expect(statuses(result)).toEqual([`${QUEUE_STATUS.EMERGENCY}/${QUEUE_STATUS.WAITING}`]);
    expect(result.queueStatuses).toHaveLength(12);

    // Schedule and emergency are returned together: events are the same as without the ГАВ post
    expect(result.hasTodayData).toBe(true);
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.events).toEqual(withoutEmergency.events);
    expect(result.hasTodayData).toBe(withoutEmergency.hasTodayData);
    expect(result.hasTomorrowData).toBe(withoutEmergency.hasTomorrowData);
    expect(statuses(withoutEmergency)).toEqual([`${QUEUE_STATUS.APPLIES}/${QUEUE_STATUS.WAITING}`]);

    // Latest update (#1950) is applied
    expect(result.events).toContainEqual(
      expect.objectContaining({ queue: '1.1', date: '2026-11-03', startTime: '10:00', endTime: '14:00' })
    );
  });

  it("does not affect tomorrow's status", () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-02T21:00:00Z')); // 23:00 Kyiv, 2 Nov

    const result = convert(nov2);

    expect(statuses(result)).toEqual([`${QUEUE_STATUS.EMERGENCY}/${QUEUE_STATUS.APPLIES}`]);
    expect(result.hasTomorrowData).toBe(true);
  });

  it('expires at midnight when no cancellation was posted', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-03T23:00:00Z')); // 01:00 Kyiv, 4 Nov

    const result = convert(nov3);

    expect(result.queueStatuses.some((s) => s.todayStatus === QUEUE_STATUS.EMERGENCY)).toBe(false);
  });

  it('is cleared by a cancellation post', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-03T08:00:00Z'));

    const cancel = { ...stubs.cherkoeCancel, date: stubs.cherkoeApply3Nov.date + 3600 };
    const result = convert([...nov3, cancel]);

    expect(statuses(result)).toEqual([`${QUEUE_STATUS.APPLIES}/${QUEUE_STATUS.WAITING}`]);
  });
});
