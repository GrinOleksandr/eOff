// @ts-nocheck
import { IParsedTgMessage } from '../../../../modules';

type TestMessageData = {
  messageNumber: number;
  message: string;
  expectedResult: IParsedTgMessage | null;
};

const example: TestMessageData = {
  messageNumber: 1,
  message: ``,
  //@ts-ignore
  expectedResult: {},
};

export const regularMessages: TestMessageData[] = [
  {
    messageNumber: 1,
    message: `
    Відповідно до команди НЕК «Укренерго», 16 грудня з 07:00 до 20:00 по Черкаській області будуть застосовані оновлені графіки погодинних відключень (ГПВ). Детальніше про оновлені графіки за посиланням https://www.cherkasyoblenergo.com/news/3629.

Години відсутності електропостачання по чергам (підчергам):

1.І 13:00-16:30
1.ІІ 13:00-16:30

2.І 15:00-16:30
2.ІІ 13:00-16:30

3.І 07:00-09:30, 16:30-19:00
3.ІІ 07:00-09:30, 16:30-19:00

4.І 08:00-09:30, 16:30-17:00, 19:00-20:00
4.ІІ 08:00-09:30, 16:30-20:00

5.І 09:30-13:00
5.ІІ 09:30-13:00

6.І 09:30-13:00
6.ІІ 09:30-12:00

Перелік адрес, що знеструмлюються по чергах (підчергах) ГПВ можна переглянути за посиланням https://www.cherkasyoblenergo.com/news/3629

Також для промисловості та бізнесу з 07:00 до 21:00 будуть застосовані графіки обмеження потужності (ГОП).

Сторінка у Telegram: t.me/pat_cherkasyoblenergo
    `,
    expectedResult: {
      eventsList: [
        {
          date: '2025-09-16',
          electricity: 'off',
          endTime: '16:30',
          provider: 'CHERKOE',
          queue: '1.1',
          startTime: '13:00',
        },
        {
          date: '2025-09-16',
          electricity: 'off',
          endTime: '16:30',
          provider: 'CHERKOE',
          queue: '1.2',
          startTime: '13:00',
        },
        {
          date: '2025-09-16',
          electricity: 'off',
          endTime: '16:30',
          provider: 'CHERKOE',
          queue: '2.1',
          startTime: '15:00',
        },
        {
          date: '2025-09-16',
          electricity: 'off',
          endTime: '16:30',
          provider: 'CHERKOE',
          queue: '2.2',
          startTime: '13:00',
        },
        {
          date: '2025-09-16',
          electricity: 'off',
          endTime: '09:30',
          provider: 'CHERKOE',
          queue: '3.1',
          startTime: '07:00',
        },
        {
          date: '2025-09-16',
          electricity: 'off',
          endTime: '19:00',
          provider: 'CHERKOE',
          queue: '3.1',
          startTime: '16:30',
        },
        {
          date: '2025-09-16',
          electricity: 'off',
          endTime: '09:30',
          provider: 'CHERKOE',
          queue: '3.2',
          startTime: '07:00',
        },
        {
          date: '2025-09-16',
          electricity: 'off',
          endTime: '19:00',
          provider: 'CHERKOE',
          queue: '3.2',
          startTime: '16:30',
        },
        {
          date: '2025-09-16',
          electricity: 'off',
          endTime: '09:30',
          provider: 'CHERKOE',
          queue: '4.1',
          startTime: '08:00',
        },
        {
          date: '2025-09-16',
          electricity: 'off',
          endTime: '17:00',
          provider: 'CHERKOE',
          queue: '4.1',
          startTime: '16:30',
        },
        {
          date: '2025-09-16',
          electricity: 'off',
          endTime: '20:00',
          provider: 'CHERKOE',
          queue: '4.1',
          startTime: '19:00',
        },
        {
          date: '2025-09-16',
          electricity: 'off',
          endTime: '09:30',
          provider: 'CHERKOE',
          queue: '4.2',
          startTime: '08:00',
        },
        {
          date: '2025-09-16',
          electricity: 'off',
          endTime: '20:00',
          provider: 'CHERKOE',
          queue: '4.2',
          startTime: '16:30',
        },
        {
          date: '2025-09-16',
          electricity: 'off',
          endTime: '13:00',
          provider: 'CHERKOE',
          queue: '5.1',
          startTime: '09:30',
        },
        {
          date: '2025-09-16',
          electricity: 'off',
          endTime: '13:00',
          provider: 'CHERKOE',
          queue: '5.2',
          startTime: '09:30',
        },
        {
          date: '2025-09-16',
          electricity: 'off',
          endTime: '13:00',
          provider: 'CHERKOE',
          queue: '6.1',
          startTime: '09:30',
        },
        {
          date: '2025-09-16',
          electricity: 'off',
          endTime: '12:00',
          provider: 'CHERKOE',
          queue: '6.2',
          startTime: '09:30',
        },
      ],
      targetDate: '2025-09-16',
    },
  },
  {
    messageNumber: 2,
    message: `Відповідно до команди НЕК «Укренерго», 18 грудня по Черкаській області скасовано графіки погодинних відключень (ГПВ).  
 
Зверніть увагу на роботу енергоємних приладів, не вмикайте одночасно кілька потужних електроприладів (електрообігрівачі, бойлери, електроплити, мікрохвильовки, пральні і сушильні машини, електричні духові шафи, посудомийні машини, кондиціонери, пилососи, електрочайники, кавоварки, праски тощо) у години пік. Ощадливо споживайте електроенергію з 08:00 до 20:00. 
 
Для промисловості та бізнесу з 07:00 до 20:00 будуть застосовані графіки обмеження потужності (ГОП). 
 
У разі змін повідомлятимемо додатково. 
 
Дякуємо за розуміння!`,
    //@ts-ignore
    expectedResult: {
      eventsList: [],
      targetDate: '2025-09-18',
    },
  },
  {
    messageNumber: 3,
    message: `Відповідно до команди НЕК «Укренерго», 25 грудня з 06:00 до 23:59 по Черкаській області будуть застосовані оновлені графіки погодинних відключень (ГПВ). Детальніше про оновлені графіки за посиланням https://www.cherkasyoblenergo.com/news/3629. 
 
Години відсутності електропостачання по чергам (підчергам): 
 
1.І 07:00-10:30, 17:30-21:00 
1.ІІ 07:00-10:30, 17:30-21:00 

2.І 07:00-10:30, 14:00-21:00 
2.ІІ 07:00-10:30, 14:00-21:00 

3.І 10:30-14:00, 17:30-00:00 
3.ІІ 10:30-14:00, 17:30-00:00 

4.І 07:00-14:00, 21:00-00:00 
4.ІІ 07:00-14:00, 21:00-00:00 

5.І 06:00-07:00, 14:00-17:30, 21:00-00:00 
5.ІІ 06:00-07:00, 14:00-17:30, 21:00-00:00 

6.І 10:30-17:30 
6.ІІ 10:30-17:30 

Перелік адрес, що знеструмлюються по чергах (підчергах) ГПВ можна переглянути за посиланням https://www.cherkasyoblenergo.com/news/3629 
 
Також для промисловості та бізнесу з 07:00 до 21:00 будуть застосовані графіки обмеження потужності (ГОП). 
 
Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
    //@ts-ignore
    expectedResult: {
      eventsList: [
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '10:30',
          provider: 'CHERKOE',
          queue: '1.1',
          startTime: '07:00',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '21:00',
          provider: 'CHERKOE',
          queue: '1.1',
          startTime: '17:30',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '10:30',
          provider: 'CHERKOE',
          queue: '1.2',
          startTime: '07:00',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '21:00',
          provider: 'CHERKOE',
          queue: '1.2',
          startTime: '17:30',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '10:30',
          provider: 'CHERKOE',
          queue: '2.1',
          startTime: '07:00',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '21:00',
          provider: 'CHERKOE',
          queue: '2.1',
          startTime: '14:00',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '10:30',
          provider: 'CHERKOE',
          queue: '2.2',
          startTime: '07:00',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '21:00',
          provider: 'CHERKOE',
          queue: '2.2',
          startTime: '14:00',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '14:00',
          provider: 'CHERKOE',
          queue: '3.1',
          startTime: '10:30',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '23:59',
          provider: 'CHERKOE',
          queue: '3.1',
          startTime: '17:30',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '14:00',
          provider: 'CHERKOE',
          queue: '3.2',
          startTime: '10:30',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '23:59',
          provider: 'CHERKOE',
          queue: '3.2',
          startTime: '17:30',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '14:00',
          provider: 'CHERKOE',
          queue: '4.1',
          startTime: '07:00',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '23:59',
          provider: 'CHERKOE',
          queue: '4.1',
          startTime: '21:00',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '14:00',
          provider: 'CHERKOE',
          queue: '4.2',
          startTime: '07:00',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '23:59',
          provider: 'CHERKOE',
          queue: '4.2',
          startTime: '21:00',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '07:00',
          provider: 'CHERKOE',
          queue: '5.1',
          startTime: '06:00',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '17:30',
          provider: 'CHERKOE',
          queue: '5.1',
          startTime: '14:00',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '23:59',
          provider: 'CHERKOE',
          queue: '5.1',
          startTime: '21:00',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '07:00',
          provider: 'CHERKOE',
          queue: '5.2',
          startTime: '06:00',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '17:30',
          provider: 'CHERKOE',
          queue: '5.2',
          startTime: '14:00',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '23:59',
          provider: 'CHERKOE',
          queue: '5.2',
          startTime: '21:00',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '17:30',
          provider: 'CHERKOE',
          queue: '6.1',
          startTime: '10:30',
        },
        {
          date: '2025-09-25',
          electricity: 'off',
          endTime: '17:30',
          provider: 'CHERKOE',
          queue: '6.2',
          startTime: '10:30',
        },
      ],
      targetDate: '2025-09-25',
    },
  },
  // {
  //   messageNumber: 1,
  //   message: ``,
  //   //@ts-ignore
  //   expectedResult: {},
  // },
  // {
  //   messageNumber: 1,
  //   message: ``,
  //   //@ts-ignore
  //   expectedResult: {},
  // },
  // {
  //   messageNumber: 1,
  //   message: ``,
  //   //@ts-ignore
  //   expectedResult: {},
  // },
  // {
  //   messageNumber: 1,
  //   message: ``,
  //   //@ts-ignore
  //   expectedResult: {},
  // },
  // {
  //   messageNumber: 1,
  //   message: ``,
  //   //@ts-ignore
  //   expectedResult: {},
  // },
  // {
  //   messageNumber: 1,
  //   message: ``,
  //   //@ts-ignore
  //   expectedResult: {},
  // },
];

export const messagesWithMinutes: TestMessageData[] = [
  //   {
  //     messageNumber: 1,
  //     message: `Графіки погодинних відключень на 19 вересня
  //
  // Години відсутності електропостачання
  //
  // 00:03-01:13  1 та 6 черги
  // 01:13-02:22  1 та 6 черги
  // 02:22-03:59  2 та 4 черги
  // 03:59-04:59  2 та 4 черги
  // 04:59-05:08  5 та 6 черги
  // 05:08-06:30  5 та 6 черги
  // 06:30-07:00  3 та 4 черги
  // 07:00-08:21  3 та 4 черги
  // 08:21-09:00  5 та 6 черги
  // 09:00-09:59  1, 5 та 6 черги
  // 09:59-11:03  1, 4 та 3 черги
  // 11:03-12:00  2, 3 та 4 черги
  // 12:00-13:00  2, 5 та 6 черги
  //
  // Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
  //     expectedResult: {
  //       eventsList: [
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '02:22',
  //           provider: 'CHERKOE',
  //           queue: '1',
  //           startTime: '00:03',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '11:03',
  //           provider: 'CHERKOE',
  //           queue: '1',
  //           startTime: '09:00',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '04:59',
  //           provider: 'CHERKOE',
  //           queue: '2',
  //           startTime: '02:22',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '13:00',
  //           provider: 'CHERKOE',
  //           queue: '2',
  //           startTime: '11:03',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '08:21',
  //           provider: 'CHERKOE',
  //           queue: '3',
  //           startTime: '06:30',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '12:00',
  //           provider: 'CHERKOE',
  //           queue: '3',
  //           startTime: '09:59',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '04:59',
  //           provider: 'CHERKOE',
  //           queue: '4',
  //           startTime: '02:22',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '08:21',
  //           provider: 'CHERKOE',
  //           queue: '4',
  //           startTime: '06:30',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '12:00',
  //           provider: 'CHERKOE',
  //           queue: '4',
  //           startTime: '09:59',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '06:30',
  //           provider: 'CHERKOE',
  //           queue: '5',
  //           startTime: '04:59',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '09:59',
  //           provider: 'CHERKOE',
  //           queue: '5',
  //           startTime: '08:21',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '13:00',
  //           provider: 'CHERKOE',
  //           queue: '5',
  //           startTime: '12:00',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '02:22',
  //           provider: 'CHERKOE',
  //           queue: '6',
  //           startTime: '00:03',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '06:30',
  //           provider: 'CHERKOE',
  //           queue: '6',
  //           startTime: '04:59',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '09:59',
  //           provider: 'CHERKOE',
  //           queue: '6',
  //           startTime: '08:21',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '13:00',
  //           provider: 'CHERKOE',
  //           queue: '6',
  //           startTime: '12:00',
  //         },
  //       ],
  //       targetDate: '2025-09-19',
  //     },
  //   },
  //   {
  //     messageNumber: 2,
  //     message: `Оновлені графіки погодинних відключень на 19 вересня
  //
  // Відповідно до команди НЕК «Укренерго», 19 вересня графіки погодинних відключень (ГПВ) будуть застосовані з 17:30 до 21:30.
  //
  // Години відсутності електропостачання:
  //
  // 17:30-18:30 1 черга
  // 18:30-19:30 1 черга
  // 19:30-20:30 2 черга
  // 20:30-21:30 2 черга
  //
  // Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
  //     expectedResult: {
  //       eventsList: [
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '19:30',
  //           provider: 'CHERKOE',
  //           queue: '1',
  //           startTime: '17:30',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '21:30',
  //           provider: 'CHERKOE',
  //           queue: '2',
  //           startTime: '19:30',
  //         },
  //       ],
  //       targetDate: '2025-09-19',
  //     },
  //   },
  //   {
  //     messageNumber: 3,
  //     message: `Оновлені графіки погодинних відключень
  //
  // Відповідно до команди НЕК «Укренерго», 19 вересня графіки погодинних відключень (ГПВ) будуть застосовані з 18:00 до 21:30.
  //
  // Години відсутності електропостачання
  //
  // 18:00-19:00 1 черга
  // 19:00-20:00 1 черга
  // 20:00-21:00 2 черга
  // 21:00-21:30 2 черга
  //
  // Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
  //     expectedResult: {
  //       eventsList: [
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '20:00',
  //           provider: 'CHERKOE',
  //           queue: '1',
  //           startTime: '18:00',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '21:30',
  //           provider: 'CHERKOE',
  //           queue: '2',
  //           startTime: '20:00',
  //         },
  //       ],
  //       targetDate: '2025-09-19',
  //     },
  //   },
  //   {
  //     // with gaps
  //     messageNumber: 4,
  //     message: `Оновлені графіки погодинних відключень
  //
  // Відповідно до команди НЕК «Укренерго», 19 вересня графіки погодинних відключень (ГПВ) будуть застосовані з 18:00 до 21:30.
  //
  // Години відсутності електропостачання
  //
  // 18:00-19:00 1 черга
  // 19:00-20:00 1 черга
  // 20:00-21:00 2 черга
  // 21:00-21:30 2 черга
  // 21:33-22:10 3 та 4 черги
  //
  // Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
  //     expectedResult: {
  //       eventsList: [
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '20:00',
  //           provider: 'CHERKOE',
  //           queue: '1',
  //           startTime: '18:00',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '21:30',
  //           provider: 'CHERKOE',
  //           queue: '2',
  //           startTime: '20:00',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '22:10',
  //           provider: 'CHERKOE',
  //           queue: '3',
  //           startTime: '21:33',
  //         },
  //         {
  //           date: '2025-09-19',
  //           electricity: 'off',
  //           endTime: '22:10',
  //           provider: 'CHERKOE',
  //           queue: '4',
  //           startTime: '21:33',
  //         },
  //       ],
  //       targetDate: '2025-09-19',
  //     },
  //   },
  {
    messageNumber: 5,
    message: `Відповідно до команди НЕК «Укренерго», 22 жовтня з 13:30 до 15:30 по Черкаській області будуть застосовані графіки погодинних відключень (ГПВ). 

Години відсутності електропостачання по чергам (підчергам):

1.І - 13:30 - 15:30 
1.ІІ - 13:30 - 15:30 

Перелік адрес, що знеструмлюються по чергах (підчергах) ГПВ можна переглянути за посиланням https://www.cherkasyoblenergo.com/static/perelik-gpv

Графіки аварійних відключень скасовано.

Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
    expectedResult: {
      eventsList: [
        {
          date: '2025-09-19',
          electricity: 'off',
          endTime: '15:30',
          provider: 'CHERKOE',
          queue: '1.1',
          startTime: '13:30',
        },
        {
          date: '2025-09-19',
          electricity: 'off',
          endTime: '15:30',
          provider: 'CHERKOE',
          queue: '1.2',
          startTime: '13:30',
        },
      ],
      targetDate: '2025-09-19',
    },
  },
];
