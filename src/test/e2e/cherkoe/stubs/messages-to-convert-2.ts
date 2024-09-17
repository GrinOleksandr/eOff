//time = any
export const onlyInitialScheduleMessage = {
  message: `Відповідно до команди НЕК «Укренерго», 4 вересня з 00:00 до 24:00 по Черкаській області будуть застосовані графіки погодинних відключень (ГПВ). 

Години відсутності електропостачання:

00:00-01:00 1 черга
01:00-02:00 1 черга
02:00-03:00 2 черга
03:00-04:00 2 черга
04:00-05:00 3 черга
05:00-06:00 4 та 5 черги
06:00-07:00 4 та 5 черги
07:00-08:00 6 та 1 черги
08:00-09:00 6 та 1 черги
09:00-10:00 2 та 3 черги
10:00-11:00 2 та 3 черги
11:00-12:00 4 черга
12:00-13:00 4 черга
13:00-14:00 5 черга
14:00-15:00 5 черга
15:00-16:00 6 та 1 черги
16:00-17:00 6 та 1 черги
17:00-18:00 2 та 3 черги
18:00-19:00 2 та 3 черги
19:00-20:00 4 та 5 черги
20:00-21:00 4 та 5 черги
21:00-22:00 6 та 1 черги
22:00-23:00 6 та 1 черги
23:00-24:00 2 та 3 черги

Загальна кількість годин знеструмлення по кожній черзі графіків погодинних відключень з початку місяця:

1 черга – 26 годин
2 черга – 28 годин
3 черга – 26 годин
4 черга – 28 годин
5 черга – 26 годин
6 черга – 27 годин

Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
};

//08:51
export const firstUpdatedScheduleMessage = {
  message: `Оновлені графіки погодинних відключень на 4 вересня

Додано черги на вимкнення. 

Години відсутності електропостачання:

09:00-10:00 2, 3 та 5 черги
10:00-11:00 2, 3 та 5 черги
11:00-12:00 4, 6 та 1 черги
12:00-13:00 4, 6 та 1 черги
13:00-14:00 5 черга
14:00-15:00 5 черга
15:00-16:00 6 та 1 черги
16:00-17:00 6 та 1 черги
17:00-18:00 2 та 3 черги
18:00-19:00 2 та 3 черги
19:00-20:00 4 та 5 черги
20:00-21:00 4 та 5 черги
21:00-22:00 6 та 1 черги
22:00-23:00 6 та 1 черги
23:00-24:00 2 та 3 черги

Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
};

//10:17
export const secondUpdatedScheduleMessage = {
  message: `
        Оновлені графіки погодинних відключень на 4 вересня

Додано черги на вимкнення. 

Години відсутності електропостачання:

10:00-11:00 2 та 3 черги
11:00-12:00 4 та 1 черги
12:00-13:00 4 та 1 черги
13:00-14:00 5 черга
14:00-15:00 5 черга
15:00-16:00 6 та 1 черги
16:00-17:00 6 та 1 черги
17:00-18:00 2 та 3 черги
18:00-19:00 2 та 3 черги
19:00-20:00 4 та 5 черги
20:00-21:00 4 та 5 черги
21:00-22:00 6 та 1 черги
22:00-23:00 6 та 1 черги
23:00-24:00 2 та 3 черги`,
};

/** EXPECTED RESULTS */
export const resultAfterInitialMessage = {
  events: [
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '02:00',
      provider: 'CHERKOE',
      queue: '1',
      startTime: '00:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '09:00',
      provider: 'CHERKOE',
      queue: '1',
      startTime: '07:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '17:00',
      provider: 'CHERKOE',
      queue: '1',
      startTime: '15:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '23:00',
      provider: 'CHERKOE',
      queue: '1',
      startTime: '21:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '04:00',
      provider: 'CHERKOE',
      queue: '2',
      startTime: '02:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '11:00',
      provider: 'CHERKOE',
      queue: '2',
      startTime: '09:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '19:00',
      provider: 'CHERKOE',
      queue: '2',
      startTime: '17:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '24:00',
      provider: 'CHERKOE',
      queue: '2',
      startTime: '23:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '05:00',
      provider: 'CHERKOE',
      queue: '3',
      startTime: '04:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '11:00',
      provider: 'CHERKOE',
      queue: '3',
      startTime: '09:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '19:00',
      provider: 'CHERKOE',
      queue: '3',
      startTime: '17:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '24:00',
      provider: 'CHERKOE',
      queue: '3',
      startTime: '23:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '07:00',
      provider: 'CHERKOE',
      queue: '4',
      startTime: '05:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '13:00',
      provider: 'CHERKOE',
      queue: '4',
      startTime: '11:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '21:00',
      provider: 'CHERKOE',
      queue: '4',
      startTime: '19:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '07:00',
      provider: 'CHERKOE',
      queue: '5',
      startTime: '05:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '15:00',
      provider: 'CHERKOE',
      queue: '5',
      startTime: '13:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '21:00',
      provider: 'CHERKOE',
      queue: '5',
      startTime: '19:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '09:00',
      provider: 'CHERKOE',
      queue: '6',
      startTime: '07:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '17:00',
      provider: 'CHERKOE',
      queue: '6',
      startTime: '15:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '23:00',
      provider: 'CHERKOE',
      queue: '6',
      startTime: '21:00',
    },
  ],
  hasTodayData: true,
  hasTomorrowData: false,
};
export const resultAfterFirstUpdate = {
  events: [
    ...resultAfterInitialMessage.events,
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '13:00',
      provider: 'CHERKOE',
      queue: '1',
      startTime: '11:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '11:00',
      provider: 'CHERKOE',
      queue: '5',
      startTime: '09:00',
    },
    {
      date: '2024-09-04',
      electricity: 'off',
      endTime: '13:00',
      provider: 'CHERKOE',
      queue: '6',
      startTime: '11:00',
    },
  ],
  hasTodayData: true,
  hasTomorrowData: false,
};
export const resultAfterSecondUpdate = {
  // events: [...resultAfterFirstUpdate.events.filter(item => item.startTime === '2024-09-04')],
  events: [...resultAfterFirstUpdate.events],
  hasTodayData: true,
  hasTomorrowData: false,
};
