import { getTargetDate } from '../../../common/utils';

describe('getTargetDate wrong-month fallback', () => {
  beforeAll(() => jest.useFakeTimers().setSystemTime(new Date('2026-10-06T12:00:00Z')));
  afterAll(() => jest.useRealTimers());

  it('treats "6 липня" posted on Oct 6 as today', () => {
    expect(getTargetDate('Оновлений графік погодинних відключень (ГПВ) на 6 липня.')?.targetDate).toBe('2026-10-06');
  });

  it('accepts tomorrow', () => {
    expect(getTargetDate('графік на 7 липня')?.targetDate).toBe('2026-10-07');
  });

  it('ignores other days', () => {
    expect(getTargetDate('графік на 20 липня')).toBeNull();
  });
});
