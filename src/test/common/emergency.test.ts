import { buildQueueStatuses, detectEmergency, IChannelMessage, isEmergencyActiveToday, QUEUES } from '../../common/emergency';
import { QUEUE_STATUS } from '../../common/types-and-interfaces';
import * as stubs from '../stubs/emergency-messages';

describe('detectEmergency', () => {
  it.each([
    ['Cherkasy: current format', stubs.cherkoeApply3Nov],
    ['Cherkasy: previous day', stubs.cherkoeApply2Nov],
    ['Cherkasy: "частково застосовані"', stubs.cherkoeApplyPartially],
    ['Cherkasy: posted near midnight', stubs.cherkoeApplyNearMidnight],
    ['Cherkasy: СГАВ', stubs.cherkoeApplySpecial],
    ['Cherkasy: "будуть скасовані" boilerplate is not a cancel', stubs.cherkoeApplyWithFutureCancelText],
    ['Cherkasy: "застосовуватимуться ... вимкнень"', stubs.cherkoeApplyFutureTense],
    ['Cherkasy: short format', stubs.cherkoeApplyShort],
    ['Kharkiv: verb on the 2nd line', stubs.khoeApply3Nov],
    ['Kharkiv: "застосовуються аварійні відключення"', stubs.khoeApply2Nov],
    ['Kharkiv: daily re-announcement', stubs.khoeApplyTypical],
    ['Kharkiv: heat overload', stubs.khoeApplyHeat],
    ['Kharkiv: with future cancel boilerplate', stubs.khoeApply],
    ['Kharkiv: by Ukrenergo command', stubs.khoeApplyUkrenergo],
    ['Kharkiv: region list, not in headline', stubs.khoeApplyRegionsList],
    ['Kharkiv: mid-post "зараз застосовуються"', stubs.khoeApplyMidPost],
    ['Cherkasy: nationwide ГАВ', stubs.cherkoeApplyNationwide],
  ])('apply: %s', (_, msg) => {
    expect(detectEmergency(msg.message)).toBe('apply');
  });

  it.each([
    ['Cherkasy: "скасовано графіки аварійних"', stubs.cherkoeCancel],
    ['Cherkasy: cancel sentence inside a ГПВ post', stubs.cherkoeCancelInsideSchedule],
    ['Kharkiv: "ГАВ ... скасовано"', stubs.khoeCancel],
    ['Kharkiv: "скасовані графіки аварійних"', stubs.khoeCancelShort],
    ['Kharkiv: "застосування ... скасовано"', stubs.khoeCancelApplying],
    ['Kharkiv: "не застосовуються"', stubs.khoeNotApplied],
    ['Kharkiv: "замінено на графіки погодинних"', stubs.khoeReplacedBySchedule],
    ['Kharkiv: "Скасовано графік аварійних"', stubs.khoeCancelSingle],
  ])('cancel: %s', (_, msg) => {
    expect(detectEmergency(msg.message)).toBe('cancel');
  });

  it.each([
    ['Cherkasy: ГПВ schedule', stubs.cherkoeSchedule3Nov],
    ['Cherkasy: ГПВ update with "Черги ГПВ/ГАВ" footer', stubs.cherkoeScheduleUpdate3Nov],
    ['Cherkasy: ГОП for business', stubs.cherkoePowerLimit3Nov],
    ['Cherkasy: article', stubs.cherkoeExplainer2Nov],
    ['Cherkasy: long article "змушені додатково застосовувати"', stubs.cherkoeExplainerLong],
    ['Cherkasy: long article "вже кілька днів поспіль застосовуються"', stubs.cherkoeExplainerDaysInRow],
    ['Cherkasy: outage types explainer', stubs.cherkoeExplainerTypes],
    ['Kharkiv: ГПВ schedule', stubs.khoeSchedule3Nov],
    ['Kharkiv: long article', stubs.khoeExplainerWhy],
    ['Kharkiv: article', stubs.khoeExplainer],
  ])('none: %s', (_, msg) => {
    expect(detectEmergency(msg.message)).toBeNull();
  });

  it.each([
    'Аварійні відключення будуть скасовані після стабілізації ситуації в енергосистемі.',
    'У Черкасах тривають аварійно-відновлювальні роботи.',
    'Чому графіки аварійних відключень (ГАВ) застосовуються, а самих графіків немає?',
    '',
  ])('none: "%s"', (text) => {
    expect(detectEmergency(text)).toBeNull();
  });
});

describe('isEmergencyActiveToday', () => {
  const HOUR = 60 * 60;
  const at = (msg: IChannelMessage, date: number): IChannelMessage => ({ ...msg, date });

  it('is active on the day of the announcement', () => {
    expect(isEmergencyActiveToday([stubs.cherkoeSchedule3Nov, stubs.cherkoeApply3Nov], '2026-11-03')).toBe(true);
  });

  it('is not carried over to the next day (providers do not post cancellations)', () => {
    expect(isEmergencyActiveToday([stubs.cherkoeApply2Nov, stubs.cherkoeSchedule3Nov], '2026-11-03')).toBe(false);
    expect(isEmergencyActiveToday([stubs.khoeApply3Nov], '2026-11-04')).toBe(false);
  });

  it('is cleared by a cancellation posted later the same day', () => {
    const apply = stubs.cherkoeApply3Nov;
    expect(isEmergencyActiveToday([apply, at(stubs.cherkoeCancel, apply.date + HOUR)], '2026-11-03')).toBe(false);
  });

  it('is re-enabled by an announcement after a cancellation', () => {
    const apply = stubs.khoeApply3Nov;
    const messages = [at(stubs.khoeCancelShort, apply.date - HOUR), apply];
    expect(isEmergencyActiveToday(messages, '2026-11-03')).toBe(true);
  });

  it('uses message time, not array order', () => {
    const apply = stubs.khoeApply3Nov;
    const cancel = at(stubs.khoeNotApplied, apply.date + HOUR);
    expect(isEmergencyActiveToday([cancel, apply], '2026-11-03')).toBe(false);
    expect(isEmergencyActiveToday([apply, at(cancel, apply.date - HOUR)], '2026-11-03')).toBe(true);
  });

  it('uses the Kyiv date of the post (00:47 Kyiv is still the previous day in UTC)', () => {
    expect(isEmergencyActiveToday([stubs.cherkoeApplyNearMidnight], '2025-11-08')).toBe(true);
    expect(isEmergencyActiveToday([stubs.cherkoeApplyNearMidnight], '2025-11-07')).toBe(false);
  });

  it('ignores unrelated and empty messages', () => {
    const date = stubs.cherkoeApply3Nov.date;
    expect(isEmergencyActiveToday([], '2026-11-03')).toBe(false);
    expect(isEmergencyActiveToday([{ date, message: '' }, stubs.cherkoeScheduleUpdate3Nov], '2026-11-03')).toBe(false);
    expect(isEmergencyActiveToday([stubs.cherkoeApply3Nov, at(stubs.cherkoeExplainer2Nov, date + HOUR)], '2026-11-03')).toBe(
      true
    );
  });
});

describe('buildQueueStatuses', () => {
  it('returns all 12 queues in order', () => {
    expect(QUEUES).toEqual(['1.1', '1.2', '2.1', '2.2', '3.1', '3.2', '4.1', '4.2', '5.1', '5.2', '6.1', '6.2']);
    expect(buildQueueStatuses(true, true, false).map((s) => s.queue)).toEqual(QUEUES);
  });

  it.each([
    [false, false, false, QUEUE_STATUS.WAITING, QUEUE_STATUS.WAITING],
    [true, false, false, QUEUE_STATUS.APPLIES, QUEUE_STATUS.WAITING],
    [false, true, false, QUEUE_STATUS.WAITING, QUEUE_STATUS.APPLIES],
    [true, true, false, QUEUE_STATUS.APPLIES, QUEUE_STATUS.APPLIES],
    [true, true, true, QUEUE_STATUS.EMERGENCY, QUEUE_STATUS.APPLIES],
    [false, false, true, QUEUE_STATUS.EMERGENCY, QUEUE_STATUS.WAITING],
  ])('today=%s tomorrow=%s emergency=%s -> %s / %s', (hasToday, hasTomorrow, emergency, today, tomorrow) => {
    buildQueueStatuses(hasToday, hasTomorrow, emergency).forEach((status) => {
      expect(status.todayStatus).toBe(today);
      expect(status.tomorrowStatus).toBe(tomorrow);
    });
  });
});
