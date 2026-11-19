import { CherkoeTgParser } from '../../../services/cherkoe/cherkoe-tg-parser';
import { KhoeParser } from '../../../services/khoe/khoe-parser';
import * as utils from '../../../common/utils';
import config from '../../../config';
import { IEoffEvent } from '../../../common/types-and-interfaces';
import {
  duplicateQueueInBlock,
  overlappingRangesInLine,
  regionOnly,
  regionThenUman,
  regionWithNoteInside,
  twoFullBlocks,
  umanThenRegion,
} from './stubs/multi-block-messages';

const sut = new CherkoeTgParser();

const hoursOf = (events: IEoffEvent[], queue: string) =>
  events.filter((e) => e.queue === queue).map((e) => `${e.startTime}-${e.endTime}`);

const queuesOf = (events: IEoffEvent[]) => [...new Set(events.map((e) => e.queue))];

describe('findScheduleConflicts', () => {
  it('reports overlapping intervals of the same queue', () => {
    expect(
      utils.findScheduleConflicts({ '1.2': [{ startTime: '00:00', endTime: '02:00' }, { startTime: '00:00', endTime: '03:00' }] })
    ).toHaveLength(1);
    expect(
      utils.findScheduleConflicts({ '1.1': [{ startTime: '12:00', endTime: '16:00' }, { startTime: '10:00', endTime: '14:00' }] })
    ).toHaveLength(1);
  });

  it('reports identical duplicates', () => {
    expect(
      utils.findScheduleConflicts({ '1.2': [{ startTime: '18:00', endTime: '21:00' }, { startTime: '18:00', endTime: '21:00' }] })
    ).toHaveLength(1);
  });

  it('accepts touching intervals, zero-length intervals and same hours on different queues', () => {
    expect(
      utils.findScheduleConflicts({
        '1.1': [{ startTime: '10:00', endTime: '12:00' }, { startTime: '12:00', endTime: '14:00' }],
        '1.2': [{ startTime: '00:00', endTime: '00:00' }, { startTime: '00:00', endTime: '00:30' }],
        '2.1': [{ startTime: '10:00', endTime: '12:00' }],
        '2.2': [{ startTime: '22:00', endTime: '24:00' }, { startTime: '20:00', endTime: '22:00' }],
      })
    ).toEqual([]);
  });
});

describe('Cherkoe parser - multi-block messages', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-11-17T12:00:00+02:00') });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('takes the region-wide block and ignores the Uman individual block', () => {
    const result = sut.parseMessage(regionThenUman);

    expect(result?.targetDate).toBe('2026-11-18');
    const events = result!.eventsList!;
    expect(queuesOf(events)).toHaveLength(12);
    expect(hoursOf(events, '1.2')).toEqual(['00:00-02:00', '06:00-08:00', '12:00-14:00', '18:00-21:00']);
    expect(hoursOf(events, '6.2')).toEqual(['10:00-12:00', '16:00-19:00', '22:00-24:00']);
    expect(hoursOf(events, '1.1')).toEqual(['00:00-02:00', '06:00-08:00', '12:00-14:00', '17:00-19:00']);
  });

  it('result does not depend on block order', () => {
    expect(sut.parseMessage(umanThenRegion)).toEqual(sut.parseMessage(regionThenUman));
  });

  it('matches the region-only message exactly', () => {
    expect(sut.parseMessage(regionThenUman)).toEqual(sut.parseMessage(regionOnly));
  });

  it('a note line between queues does not split the schedule', () => {
    expect(sut.parseMessage(regionWithNoteInside)).toEqual(sut.parseMessage(regionOnly));
  });

  it('ignores a message with two equally complete blocks (ambiguous)', () => {
    expect(sut.parseMessage(twoFullBlocks)).toBeNull();
  });

  it('ignores a message that lists the same queue twice in one block', () => {
    expect(sut.parseMessage(duplicateQueueInBlock)).toBeNull();
  });

  it('ignores a message with overlapping ranges', () => {
    expect(sut.parseMessage(overlappingRangesInLine)).toBeNull();
  });

  it('keeps the previous valid schedule when a newer message for the same date is broken', () => {
    const date = Math.floor(new Date('2026-11-17T10:00:00+02:00').getTime() / 1000);
    const valid = { message: regionOnly, date };
    const broken = { message: overlappingRangesInLine, date: date + 3600 };

    // @ts-ignore - simplified Api.Message mocks
    const withBroken = sut.convertMessagesToEvents([valid, broken]);
    // @ts-ignore
    const validOnly = sut.convertMessagesToEvents([valid]);

    expect(withBroken).toEqual(validOnly);
    expect(withBroken.hasTomorrowData).toBe(true);
    expect(hoursOf(withBroken.events, '1.1')).toEqual(['00:00-02:00', '06:00-08:00', '12:00-14:00', '17:00-19:00']);
  });
});

describe('notifyError - Telegram alerts', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    config.alerts = { botToken: 'test-token', chatId: '123' };
    fetchMock.mockReset().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as any;
  });

  afterEach(() => {
    config.alerts = {};
  });

  it('sends a broken message alert to the chat once, not on every re-read', async () => {
    jest.useFakeTimers({ now: new Date('2026-11-17T12:00:00+02:00') });
    sut.parseMessage(overlappingRangesInLine);
    sut.parseMessage(overlappingRangesInLine);
    jest.useRealTimers();
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.telegram.org/bottest-token/sendMessage');
    const body = JSON.parse(init.body);
    expect(body.chat_id).toBe('123');
    expect(body.text).toContain('cherkoe: ignoring message for 2026-11-18, overlapping intervals');
  });

  it('retries on the next call when sending failed', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'));
    await utils.notifyError('retry me');
    await utils.notifyError('retry me');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does nothing when the bot is not configured', async () => {
    config.alerts = {};
    await utils.notifyError('no bot');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('Khoe parser - overlap guard', () => {
  const khoe = new KhoeParser();
  const targetDate = {
    targetDate: '2026-11-18',
    rawDateObj: { day: 18, year: 2026, name: 'листопада', index: 11 },
  };
  const newsItem = (text: string[]) => ({ title: '', url: '', date: '', targetDate, text }) as any;

  it('ignores news with overlapping ranges', () => {
    expect(khoe.parseNewsItemText(newsItem(['1.1 10:00 - 14:00, 12:00 - 16:00', '1.2 08:00 - 10:00']))).toBeNull();
  });

  it('parses valid news as before', () => {
    const result = khoe.parseNewsItemText(newsItem(['1.1 10:00 - 12:00, 12:00 - 16:00', '1.2 08:00 - 10:00']));
    expect(hoursOf(result!.eventsList!, '1.1')).toEqual(['10:00-16:00']);
    expect(hoursOf(result!.eventsList!, '1.2')).toEqual(['08:00-10:00']);
  });
});
