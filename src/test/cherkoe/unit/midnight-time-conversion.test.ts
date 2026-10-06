import { CherkoeTgParser } from '../../../services/cherkoe/cherkoe-tg-parser';
import * as utilsModule from '../../../common/utils';
import { MONTH_NAMES } from '../../../common/utils';

const sut = new CherkoeTgParser();

describe('Cherkoe Parser - Midnight Time Conversion', () => {
  beforeEach(() => {
    jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({ index: 0, name: MONTH_NAMES[0], year: 2026 });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should NOT convert 00:00 to 24:00 when startTime also starts with 00:', () => {
    const message = `АТ "Черкасиобленерго", [15.01.2026 10:00]
Графік погодинних вимкнень на 16 січня 2026 року
1.1 00:00 - 00:30`;

    const result = sut.parseMessage(message);

    expect(result).not.toBeNull();
    expect(result?.eventsList).toHaveLength(1);
    expect(result!.eventsList![0].startTime).toBe('00:00');
    expect(result!.eventsList![0].endTime).toBe('00:30'); // Should NOT be 24:30
  });

  it('should convert 00:00 to 24:00 when startTime does NOT start with 00: (midnight crossing)', () => {
    const message = `АТ "Черкасиобленерго", [15.01.2026 10:00]
Графік погодинних вимкнень на 16 січня 2026 року
1.1 22:00 - 00:00`;

    const result = sut.parseMessage(message);

    expect(result).not.toBeNull();
    expect(result?.eventsList).toHaveLength(1);
    expect(result!.eventsList![0].startTime).toBe('22:00');
    expect(result!.eventsList![0].endTime).toBe('24:00'); // Should be converted to 24:00
  });

  it('should cap endTime at 24:00 when crossing midnight (23:30 - 00:15)', () => {
    const message = `АТ "Черкасиобленерго", [15.01.2026 10:00]
Графік погодинних вимкнень на 16 січня 2026 року
1.1 23:30 - 00:15`;

    const result = sut.parseMessage(message);

    expect(result).not.toBeNull();
    expect(result?.eventsList).toHaveLength(1);
    expect(result!.eventsList![0].startTime).toBe('23:30');
    expect(result!.eventsList![0].endTime).toBe('24:00'); // Capped at midnight (events don't cross midnight)
  });

  it('should handle multiple time ranges with mixed midnight behavior', () => {
    const message = `АТ "Черкасиобленерго", [15.01.2026 10:00]
Графік погодинних вимкнень на 16 січня 2026 року
1.1 00:00 - 00:30, 08:00 - 12:00, 22:00 - 00:00`;

    const result = sut.parseMessage(message);

    expect(result).not.toBeNull();
    expect(result?.eventsList).toHaveLength(3);

    // First range: 00:00 - 00:30 (should stay as is)
    expect(result!.eventsList![0].startTime).toBe('00:00');
    expect(result!.eventsList![0].endTime).toBe('00:30');

    // Second range: 08:00 - 12:00 (no conversion needed)
    expect(result!.eventsList![1].startTime).toBe('08:00');
    expect(result!.eventsList![1].endTime).toBe('12:00');

    // Third range: 22:00 - 00:00 (should convert to 24:00)
    expect(result!.eventsList![2].startTime).toBe('22:00');
    expect(result!.eventsList![2].endTime).toBe('24:00');
  });

  it('should NOT convert when both start and end are 00:00 (zero duration)', () => {
    const message = `АТ "Черкасиобленерго", [15.01.2026 10:00]
Графік погодинних вимкнень на 16 січня 2026 року
1.1 00:00 - 00:00`;

    const result = sut.parseMessage(message);

    expect(result).not.toBeNull();
    expect(result?.eventsList).toHaveLength(1);
    expect(result!.eventsList![0].startTime).toBe('00:00');
    expect(result!.eventsList![0].endTime).toBe('00:00'); // Should NOT be 24:00
  });

  it('should handle 00:45 correctly when startTime is also 00:', () => {
    const message = `АТ "Черкасиобленерго", [15.01.2026 10:00]
Графік погодинних вимкнень на 16 січня 2026 року
1.1 00:15 - 00:45`;

    const result = sut.parseMessage(message);

    expect(result).not.toBeNull();
    expect(result?.eventsList).toHaveLength(1);
    expect(result!.eventsList![0].startTime).toBe('00:15');
    expect(result!.eventsList![0].endTime).toBe('00:45'); // Should NOT be 24:45
  });

  it('should cap at 24:00 for evening to early morning crossing (18:00 - 00:30)', () => {
    const message = `АТ "Черкасиобленерго", [15.01.2026 10:00]
Графік погодинних вимкнень на 16 січня 2026 року
1.1 18:00 - 00:30`;

    const result = sut.parseMessage(message);

    expect(result).not.toBeNull();
    expect(result?.eventsList).toHaveLength(1);
    expect(result!.eventsList![0].startTime).toBe('18:00');
    expect(result!.eventsList![0].endTime).toBe('24:00'); // Capped at midnight
  });

  it('should cap at 24:00 for late evening crossing (20:00 - 00:45)', () => {
    const message = `АТ "Черкасиобленерго", [15.01.2026 10:00]
Графік погодинних вимкнень на 16 січня 2026 року
1.1 20:00 - 00:45`;

    const result = sut.parseMessage(message);

    expect(result).not.toBeNull();
    expect(result?.eventsList).toHaveLength(1);
    expect(result!.eventsList![0].startTime).toBe('20:00');
    expect(result!.eventsList![0].endTime).toBe('24:00'); // Capped at midnight
  });

  it('should cap at 24:00 even for 1 minute past midnight (23:59 - 00:01)', () => {
    const message = `АТ "Черкасиобленерго", [15.01.2026 10:00]
Графік погодинних вимкнень на 16 січня 2026 року
1.1 23:59 - 00:01`;

    const result = sut.parseMessage(message);

    expect(result).not.toBeNull();
    expect(result?.eventsList).toHaveLength(1);
    expect(result!.eventsList![0].startTime).toBe('23:59');
    expect(result!.eventsList![0].endTime).toBe('24:00'); // Capped at midnight
  });

  it('should handle mix of early morning and midnight-capped events', () => {
    const message = `АТ "Черкасиобленерго", [15.01.2026 10:00]
Графік погодинних вимкнень на 16 січня 2026 року
1.1 00:00 - 00:30
2.1 10:00 - 14:00
3.1 20:00 - 00:15
4.1 00:45 - 01:00`;

    const result = sut.parseMessage(message);

    expect(result).not.toBeNull();
    expect(result?.eventsList).toHaveLength(4);

    // Queue 1.1: 00:00 - 00:30 (early morning, stays as is)
    const event1 = result!.eventsList!.find((e) => e.queue === '1.1');
    expect(event1?.startTime).toBe('00:00');
    expect(event1?.endTime).toBe('00:30');

    // Queue 2.1: 10:00 - 14:00 (midday, no conversion)
    const event2 = result!.eventsList!.find((e) => e.queue === '2.1');
    expect(event2?.startTime).toBe('10:00');
    expect(event2?.endTime).toBe('14:00');

    // Queue 3.1: 20:00 - 00:15 (evening to morning, capped at midnight)
    const event3 = result!.eventsList!.find((e) => e.queue === '3.1');
    expect(event3?.startTime).toBe('20:00');
    expect(event3?.endTime).toBe('24:00');

    // Queue 4.1: 00:45 - 01:00 (early morning, stays as is)
    const event4 = result!.eventsList!.find((e) => e.queue === '4.1');
    expect(event4?.startTime).toBe('00:45');
    expect(event4?.endTime).toBe('01:00');
  });
});
