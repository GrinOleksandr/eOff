const today_2am = 1765411200;
const today_4am = 1765418400;

export const messages = [
  {
    message: `Оновлений графік погодинних вимкнень на 11 грудня за командою НЕК «Укренерго».

Години відсутності електропостачання:

6.1 02:00 - 05:00, 08:00 - 12:00, 14:00 - 18:00, 20:00 - 24:00

6.2 00:00 - 03:00, 06:00 - 10:00, 12:00 - 16:00, 18:00 - 22:00

Перелік адрес, що знеструмлюються по чергах (підчергах) ГПВ можна переглянути за посиланням https://www.cherkasyoblenergo.com/off

 (https://www.cherkasyoblenergo.com/off)Зверніть увагу, ситуація в енергосистемі може змінюватися, тому стежте за нашими оновленнями.

Сторінка у Telegram: t.me/pat_cherkasyoblenergo (https://gita.cherkasyoblenergo.com/obl-main-controller/admin/news/t.me/pat_cherkasyoblenergo)`,
    date: today_2am,
  },
  {
    message: `Оновлений графік погодинних вимкнень на 11 грудня за командою НЕК «Укренерго».

Години відсутності електропостачання:

6.1 02:00 - 05:00, 08:00 - 12:00, 14:00 - 18:00, 20:00 - 24:00

6.2 06:00 - 10:00, 12:00 - 16:00, 18:00 - 22:00

Перелік адрес, що знеструмлюються по чергах (підчергах) ГПВ можна переглянути за посиланням https://www.cherkasyoblenergo.com/off

 (https://www.cherkasyoblenergo.com/off)Зверніть увагу, ситуація в енергосистемі може змінюватися, тому стежте за нашими оновленнями.

Сторінка у Telegram: t.me/pat_cherkasyoblenergo (https://gita.cherkasyoblenergo.com/obl-main-controller/admin/news/t.me/pat_cherkasyoblenergo)`,
    date: today_4am,
  },
  {
    message: `Оновлений графік погодинних вимкнень на 11 грудня за командою НЕК «Укренерго».

Години відсутності електропостачання:

6.1 02:00 - 05:00, 08:00 - 12:00, 14:00 - 18:00, 20:00 - 24:00

6.2 12:00 - 16:00, 18:00 - 22:00

Перелік адрес, що знеструмлюються по чергах (підчергах) ГПВ можна переглянути за посиланням https://www.cherkasyoblenergo.com/off

 (https://www.cherkasyoblenergo.com/off)Зверніть увагу, ситуація в енергосистемі може змінюватися, тому стежте за нашими оновленнями.

Сторінка у Telegram: t.me/pat_cherkasyoblenergo (https://gita.cherkasyoblenergo.com/obl-main-controller/admin/news/t.me/pat_cherkasyoblenergo)`,
    date: today_4am,
  },
];

/** EXPECTED RESULTS */
export const expectedResult = {
  events: [
    {
      date: '2025-12-11',
      electricity: 'off',
      endTime: '05:00',
      provider: 'CHERKOE',
      queue: '6.1',
      startTime: '02:00',
    },
    {
      date: '2025-12-11',
      electricity: 'off',
      endTime: '12:00',
      provider: 'CHERKOE',
      queue: '6.1',
      startTime: '08:00',
    },
    {
      date: '2025-12-11',
      electricity: 'off',
      endTime: '18:00',
      provider: 'CHERKOE',
      queue: '6.1',
      startTime: '14:00',
    },
    {
      date: '2025-12-11',
      electricity: 'off',
      endTime: '24:00',
      provider: 'CHERKOE',
      queue: '6.1',
      startTime: '20:00',
    },
    {
      date: '2025-12-11',
      electricity: 'off',
      endTime: '03:00',
      provider: 'CHERKOE',
      queue: '6.2',
      startTime: '00:00',
    },
    {
      date: '2025-12-11',
      electricity: 'off',
      endTime: '16:00',
      provider: 'CHERKOE',
      queue: '6.2',
      startTime: '12:00',
    },
    {
      date: '2025-12-11',
      electricity: 'off',
      endTime: '22:00',
      provider: 'CHERKOE',
      queue: '6.2',
      startTime: '18:00',
    },
  ],
  hasTodayData: true,
  hasTomorrowData: false,
};
