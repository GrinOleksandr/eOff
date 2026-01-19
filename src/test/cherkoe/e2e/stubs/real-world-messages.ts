import { ELECTRICITY_PROVIDER, ELECTRICITY_STATUS, ISchedule } from '../../../../common/types-and-interfaces';

/**
 * Real-world message samples from Cherkasy Oblast Energy Company
 * These messages represent various scenarios:
 * - Multiple updates to the same schedule
 * - Different queue formats (1.1, 1.2, 2.1, 2.2, etc.)
 * - Time formats with minutes (08:30, 14:30, etc.)
 * - Emergency shutdown announcements
 * - Power limitation announcements
 * - Messages with media/links
 */

// Message 1: Initial schedule for January 15, 2026 (posted on Jan 14, 23:31)
// @ts-ignore - Simplified mock for testing
export const jan15InitialSchedule = {
  message: `АТ "Черкасиобленерго", [14.01.2026 23:31]
Оновлений графік погодинних вимкнень на 15 січня за командою НЕК «Укренерго».

Години відсутності електропостачання:

1.1 00:00 - 02:00, 04:00 - 07:00, 10:00 - 14:00, 16:00 - 20:00, 22:00 - 24:00

1.2 00:00 - 02:00, 04:00 - 08:00, 11:00 - 14:00, 16:00 - 20:00

2.1 03:00 - 06:00, 08:00 - 12:00, 14:00 - 18:00, 21:00 - 23:00

2.2 02:00 - 05:00, 08:00 - 12:00, 14:00 - 18:00, 20:00 - 22:00

3.1 00:00 - 04:00, 07:00 - 10:00, 12:00 - 16:00, 18:00 - 21:00

3.2 00:00 - 03:00, 06:00 - 08:00, 10:00 - 14:00, 16:00 - 19:00, 23:00 - 24:00

4.1 00:00 - 04:00, 06:00 - 09:00, 12:00 - 16:00, 18:00 - 22:00

4.2 00:00 - 01:00, 05:00 - 08:00, 10:00 - 14:00, 16:00 - 20:00, 22:00 - 24:00

5.1 02:00 - 06:00, 09:00 - 12:00, 14:00 - 18:00, 22:00 - 24:00

5.2 01:00 - 04:00, 07:00 - 10:00, 12:00 - 16:00, 18:00 - 22:00

6.1 04:00 - 06:00, 08:00 - 12:00, 14:00 - 18:00, 20:00 - 24:00

6.2 06:00 - 10:00, 12:00 - 16:00, 19:00 - 22:00

Перелік адрес, що знеструмлюються по чергах (підчергах) ГПВ можна переглянути за посиланням https://www.cherkasyoblenergo.com/off

Зверніть увагу, ситуація в енергосистемі може змінюватися, тому стежте за нашими оновленнями.

Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
  date: 1736894460, // Jan 14, 2026 23:31:00 UTC
};

// Message 2: First update for January 15 (posted on Jan 15, 01:50)
export const jan15FirstUpdate = {
  message: `АТ "Черкасиобленерго", [15.01.2026 01:50]
Оновлений графік погодинних вимкнень на 15 січня за командою НЕК «Укренерго».

Години відсутності електропостачання:

1.1 00:00 - 02:00, 04:00 - 07:00, 10:00 - 14:00, 16:00 - 20:00, 22:00 - 24:00

1.2 00:00 - 02:00, 04:00 - 08:00, 11:00 - 14:00, 16:00 - 20:00

2.1 02:00 - 06:00, 08:00 - 12:00, 14:00 - 18:00, 21:00 - 23:00

2.2 02:00 - 05:00, 08:00 - 12:00, 14:00 - 18:00, 20:00 - 22:00

3.1 00:00 - 04:00, 07:00 - 10:00, 12:00 - 16:00, 18:00 - 21:00

3.2 00:00 - 03:00, 05:00 - 08:00, 10:00 - 14:00, 16:00 - 19:00, 23:00 - 24:00

4.1 00:00 - 04:00, 06:00 - 09:00, 12:00 - 16:00, 18:00 - 22:00

4.2 00:00 - 01:00, 04:00 - 08:00, 10:00 - 14:00, 16:00 - 20:00, 22:00 - 24:00

5.1 02:00 - 06:00, 09:00 - 12:00, 14:00 - 18:00, 22:00 - 24:00

5.2 01:00 - 04:00, 06:00 - 10:00, 12:00 - 16:00, 18:00 - 22:00

6.1 03:00 - 06:00, 08:00 - 12:00, 14:00 - 18:00, 20:00 - 24:00

6.2 06:00 - 10:00, 12:00 - 16:00, 19:00 - 22:00

Перелік адрес, що знеструмлюються по чергах (підчергах) ГПВ можна переглянути за посиланням https://www.cherkasyoblenergo.com/off

Зверніть увагу, ситуація в енергосистемі може змінюватися, тому стежте за нашими оновленнями.

Сторінка у Telegram: t.me/pat_cherkasyoblenergo (https://gita.cherkasyoblenergo.com/obl-main-controller/admin/news/t.me/pat_cherkasyoblenergo)`,
  date: 1736903400, // Jan 15, 2026 01:50:00 UTC
};

// Message 3: Emergency shutdown announcement (no schedule data)
export const jan15EmergencyShutdown = {
  message: `АТ "Черкасиобленерго", [15.01.2026 10:23]
Через наслідки попередніх масованих ракетно-дронових атак 15 січня з 10:15 по Черкаській області застосовані графіки аварійних відключень (ГАВ) за командою НЕК "Укренерго".

Також продовжують діяти графіки погодинних відключень (ГПВ).

Просимо з розумінням поставитися до вжитих заходів, спрямованих на збереження енергосистеми України.

Сьогодні є необхідність у дуже ощадливому споживанні електроенергії.`,
  date: 1736934180, // Jan 15, 2026 10:23:00 UTC
};

// Message 4: Updated schedule with reduced outages (posted at 17:30)
export const jan15ReducedSchedule = {
  message: `АТ "Черкасиобленерго", [15.01.2026 17:30]
Оновлений графік погодинних вимкнень на 15 січня за командою НЕК «Укренерго».

Години відсутності електропостачання:

1.1 16:00 - 20:00, 22:00 - 24:00

1.2 16:00 - 20:00

2.1 14:00 - 18:00, 21:00 - 23:00

2.2 14:00 - 18:00, 20:00 - 22:00

3.1 18:00 - 21:00

3.2 16:00 - 19:00, 23:00 - 24:00

4.1 18:00 - 22:00

4.2 16:00 - 20:00, 22:00 - 24:00

5.1 14:00 - 18:00, 22:00 - 24:00

5.2 18:00 - 22:00

6.1 14:00 - 18:00, 20:00 - 24:00

6.2 18:00 - 22:00

Перелік адрес, що знеструмлюються по чергах (підчергах) ГПВ можна переглянути за посиланням https://www.cherkasyoblenergo.com/off

Зверніть увагу, ситуація в енергосистемі може змінюватися, тому стежте за нашими оновленнями.

Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
  date: 1736959800, // Jan 15, 2026 17:30:00 UTC
};

// Message 5: Schedule with minutes (Jan 16, 22:40)
export const jan16ScheduleWithMinutes = {
  message: `АТ "Черкасиобленерго", [15.01.2026 22:40]
Через постійні ворожі обстріли та наслідки попередніх масованих ракетно-дронових атак по Черкаській області 16 січня за командою НЕК «Укренерго» застосовуватимуться графіки погодинних вимкнень (ГПВ).

Години відсутності електропостачання:

1.1 00:00 - 02:00, 04:00 - 08:30, 10:00 - 14:30, 16:00 - 20:00, 22:00 - 24:00

1.2 00:00 - 02:00, 05:00 - 08:30, 10:30 - 15:00, 16:30 - 20:00, 22:00 - 24:00

2.1 03:00 - 06:00, 08:30 - 13:00, 14:30 - 18:00, 20:00 - 22:00

2.2 02:00 - 06:00, 08:30 - 13:00, 14:30 - 19:00, 21:00 - 24:00

3.1 00:00 - 03:00, 06:00 - 10:00, 11:30 - 16:00, 17:30 - 21:00, 23:00 - 24:00

3.2 00:00 - 01:00, 04:00 - 08:00, 10:00 - 14:30, 16:00 - 20:00, 22:00 - 24:00

4.1 01:00 - 04:00, 06:00 - 10:00, 11:30 - 16:00, 17:30 - 22:00

4.2 00:00 - 02:00, 04:00 - 07:30, 09:00 - 13:30, 15:00 - 19:30, 22:00 - 24:00

5.1 02:00 - 06:00, 07:30 - 11:30, 13:00 - 17:30, 19:30 - 22:00

5.2 00:00 - 04:00, 07:00 - 11:30, 13:00 - 17:30, 19:00 - 22:00

6.1 02:00 - 05:00, 08:00 - 12:00, 13:30 - 18:00, 20:00 - 23:00

6.2 00:00 - 04:00, 06:00 - 10:30, 12:00 - 16:30, 18:00 - 22:00

Перелік адрес, що знеструмлюються по чергах (підчергах) ГПВ можна переглянути за посиланням https://www.cherkasyoblenergo.com/off

Зверніть увагу, ситуація в енергосистемі може змінюватися, тому стежте за нашими оновленнями.

Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
  date: 1736978400, // Jan 15, 2026 22:40:00 UTC
};

// Message 6: Power limitation announcement (no schedule data)
export const jan16PowerLimitation = {
  message: `АТ "Черкасиобленерго", [15.01.2026 19:28]
Відповідно до команди НЕК "Укренерго" для промисловості та бізнесу Черкаської області 16 січня з 00:00 до 24:00 будуть застосовані графіки обмеження потужності (ГОП).`,
  date: 1736967280, // Jan 15, 2026 19:28:00 UTC
};

// Message 7: Schedule with minimal outages (Jan 19, 09:03)
export const jan19MinimalOutages = {
  message: `АТ "Черкасиобленерго", [19.01.2026 09:03]
Оновлений графік погодинних вимкнень на 19 січня за командою НЕК «Укренерго».

Години відсутності електропостачання:

1.1 06:00 - 10:00, 11:30 - 16:00, 17:30 - 22:00

1.2 06:00 - 10:30, 12:00 - 16:30, 18:00 - 21:00

2.1 09:00 - 13:30, 15:00 - 19:00, 21:00 - 24:00

2.2 09:30 - 14:00, 15:30 - 20:00, 22:00 - 24:00

3.1 10:00 - 14:30, 16:00 - 20:00, 22:00 - 24:00

3.2 06:00 - 09:30, 11:00 - 15:30, 17:00 - 21:00

4.1 07:00 - 11:00, 12:30 - 17:00, 18:30 - 22:00

4.2 10:30 - 15:00, 16:30 - 21:00, 23:00 - 24:00

5.1 09:00 - 13:00, 14:30 - 19:00, 21:00 - 24:00

5.2 08:00 - 12:30, 14:00 - 18:30, 21:00 - 24:00

6.1 08:00 - 12:00, 13:30 - 18:00, 20:00 - 23:00

6.2 07:00 - 11:30, 13:00 - 17:30, 19:00 - 22:00

Перелік адрес, що знеструмлюються по чергах (підчергах) ГПВ можна переглянути за посиланням https://www.cherkasyoblenergo.com/off

Зверніть увагу, ситуація в енергосистемі може змінюватися, тому стежте за нашими оновленнями.

Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
  date: 1737276180, // Jan 19, 2026 09:03:00 UTC
};

// Message 8: Empty schedule for some groups (Jan 18, 22:05)
export const jan18PartialSchedule = {
  message: `АТ "Черкасиобленерго", [18.01.2026 22:05]
Оновлений графік погодинних вимкнень на 18 січня за командою НЕК «Укренерго».

Години відсутності електропостачання:

1.1 23:00 - 24:00

2.1 21:00 - 24:00

2.2 21:00 - 24:00

3.1 23:00 - 24:00

3.2 23:00 - 24:00

5.1 22:00 - 24:00

5.2 19:00 - 23:00

6.1 20:00 - 23:00

6.2 21:00 - 23:00

Перелік адрес, що знеструмлюються по чергах (підчергах) ГПВ можна переглянути за посиланням https://www.cherkasyoblenergo.com/off

Зверніть увагу, ситуація в енергосистемі може змінюватися, тому стежте за нашими оновленнями.

Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
  date: 1737238500, // Jan 18, 2026 22:05:00 UTC
};

// Message 9: Informational message with video link (no schedule)
export const jan15InformationalMessage = {
  message: `АТ "Черкасиобленерго", [15.01.2026 23:15]
​​ (https://youtu.be/LhPVyuT4LUE)Оновлені графіки погодинних відключень електроенергії запровадили на Черкащині з 14 січня. Нині ж триває перехідний період з налаштування їхнього коректного функціонування. Про це йшлося на брифінгу в медіацентрі ОВА.

Ситуація в енергосистемі країни лишається складною через постійні ворожі обстріли. Енергетики роблять усе можливе, щоб єдина об'єднана енергосистема функціонувала та відновлювалася після атак.

- Графіки погодинних відключень, як і графіки аварійних, є вимушеним заходом для балансування нашої енергосистеми, - наголосив заступник начальника Центральної диспетчерської служби по роботі з персоналом АТ «Черкасиобленерго» Дмитро Чорнобривець.

При формуванні оновлених графіків переглянули перелік об'єктів критичної інфраструктури на території Черкаської області.

Переглянути актуальні графіки погодинних відключень електроенергії на Черкащині можна за посиланням: https://www.cherkasyoblenergo.com/off

ДЕТАЛЬНІШЕ - У ВІДЕО.`,
  date: 1736980500, // Jan 15, 2026 23:15:00 UTC
};

// Expected result for initial Jan 15 schedule
export const jan15InitialExpectedResult: ISchedule = {
  events: [
    // 1.1
    { queue: '1.1', date: '2026-01-15', startTime: '00:00', endTime: '02:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '1.1', date: '2026-01-15', startTime: '04:00', endTime: '07:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '1.1', date: '2026-01-15', startTime: '10:00', endTime: '14:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '1.1', date: '2026-01-15', startTime: '16:00', endTime: '20:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '1.1', date: '2026-01-15', startTime: '22:00', endTime: '24:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    // 1.2
    { queue: '1.2', date: '2026-01-15', startTime: '00:00', endTime: '02:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '1.2', date: '2026-01-15', startTime: '04:00', endTime: '08:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '1.2', date: '2026-01-15', startTime: '11:00', endTime: '14:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '1.2', date: '2026-01-15', startTime: '16:00', endTime: '20:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    // 2.1
    { queue: '2.1', date: '2026-01-15', startTime: '03:00', endTime: '06:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '2.1', date: '2026-01-15', startTime: '08:00', endTime: '12:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '2.1', date: '2026-01-15', startTime: '14:00', endTime: '18:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '2.1', date: '2026-01-15', startTime: '21:00', endTime: '23:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    // 2.2
    { queue: '2.2', date: '2026-01-15', startTime: '02:00', endTime: '05:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '2.2', date: '2026-01-15', startTime: '08:00', endTime: '12:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '2.2', date: '2026-01-15', startTime: '14:00', endTime: '18:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '2.2', date: '2026-01-15', startTime: '20:00', endTime: '22:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    // 3.1
    { queue: '3.1', date: '2026-01-15', startTime: '00:00', endTime: '04:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '3.1', date: '2026-01-15', startTime: '07:00', endTime: '10:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '3.1', date: '2026-01-15', startTime: '12:00', endTime: '16:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '3.1', date: '2026-01-15', startTime: '18:00', endTime: '21:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    // 3.2
    { queue: '3.2', date: '2026-01-15', startTime: '00:00', endTime: '03:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '3.2', date: '2026-01-15', startTime: '06:00', endTime: '08:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '3.2', date: '2026-01-15', startTime: '10:00', endTime: '14:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '3.2', date: '2026-01-15', startTime: '16:00', endTime: '19:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '3.2', date: '2026-01-15', startTime: '23:00', endTime: '24:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    // 4.1
    { queue: '4.1', date: '2026-01-15', startTime: '00:00', endTime: '04:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '4.1', date: '2026-01-15', startTime: '06:00', endTime: '09:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '4.1', date: '2026-01-15', startTime: '12:00', endTime: '16:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '4.1', date: '2026-01-15', startTime: '18:00', endTime: '22:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    // 4.2
    { queue: '4.2', date: '2026-01-15', startTime: '00:00', endTime: '01:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '4.2', date: '2026-01-15', startTime: '05:00', endTime: '08:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '4.2', date: '2026-01-15', startTime: '10:00', endTime: '14:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '4.2', date: '2026-01-15', startTime: '16:00', endTime: '20:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '4.2', date: '2026-01-15', startTime: '22:00', endTime: '24:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    // 5.1
    { queue: '5.1', date: '2026-01-15', startTime: '02:00', endTime: '06:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '5.1', date: '2026-01-15', startTime: '09:00', endTime: '12:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '5.1', date: '2026-01-15', startTime: '14:00', endTime: '18:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '5.1', date: '2026-01-15', startTime: '22:00', endTime: '24:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    // 5.2
    { queue: '5.2', date: '2026-01-15', startTime: '01:00', endTime: '04:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '5.2', date: '2026-01-15', startTime: '07:00', endTime: '10:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '5.2', date: '2026-01-15', startTime: '12:00', endTime: '16:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '5.2', date: '2026-01-15', startTime: '18:00', endTime: '22:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    // 6.1
    { queue: '6.1', date: '2026-01-15', startTime: '04:00', endTime: '06:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '6.1', date: '2026-01-15', startTime: '08:00', endTime: '12:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '6.1', date: '2026-01-15', startTime: '14:00', endTime: '18:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '6.1', date: '2026-01-15', startTime: '20:00', endTime: '24:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    // 6.2
    { queue: '6.2', date: '2026-01-15', startTime: '06:00', endTime: '10:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '6.2', date: '2026-01-15', startTime: '12:00', endTime: '16:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
    { queue: '6.2', date: '2026-01-15', startTime: '19:00', endTime: '22:00', electricity: ELECTRICITY_STATUS.OFF, provider: ELECTRICITY_PROVIDER.CHERKOE },
  ],
  hasTodayData: false,
  hasTomorrowData: true,
};