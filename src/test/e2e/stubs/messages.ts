import { ISchedule } from '../../../services/cherkoe';
import { IParsedTgMessage } from '../../../services/cherkoe-tg-parser';

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
    // schedule update
    messageNumber: 1,
    message: `
    Оновлені графіки погодинних відключень на 26 вересня

З 16:00 до 18:00 зменшено кількість черг.

Години відсутності електропостачання: 

16:00-17:00 3 черга
17:00-18:00 4 черги
18:00-19:00 4 черги
19:00-20:00 6 черги
20:00-21:00 1 та 6 черги
21:00-22:00 1 та 2 черги
22:00-23:00 2 та 5 черги
23:00-24:00 5 черга

Сторінка у Telegram: t.me/pat_cherkasyoblenergo
    `,
    expectedResult: {
      eventsList: [
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '22:00',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '20:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '23:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '21:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '17:00',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '16:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '19:00',
          provider: 'CHERKOE',
          queue: '4',
          startTime: '17:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '24:00',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '22:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '21:00',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '19:00',
        },
      ],
      targetDate: '2024-09-26',
    },
  },
  {
    // no schedule in this message
    messageNumber: 2,
    message: `У відповідності до чинного законодавства індивідуальні та колективні побутові споживачі, які проживають в житлових будинках (у тому числі в житлових будинках готельного типу, квартирах), обладнаних електроопалювальними установками, можуть платити за спожиту електроенергію за пільговим тарифом (https://cherkasyoblenergo.com/news/3416) у період з 1 жовтня 2024 по 30 квітня 2025 (включно), а саме: до 2000 кВт∙год спожитої електричної енергії на місяць (включно, за весь обсяг споживання) фіксована ціна складатиме 2,64 грн/кВт∙год, понад 2000 кВт∙год спожитої електричної енергії на місяць (включно, за весь обсяг споживання) ціна складатиме 4,32 грн/кВт год.

Постановою Кабінету Міністрів України від 31.05.2024 № 632 внесено зміни до Положення про покладення спеціальних обов'язків на учасників ринку електричної енергії для забезпечення загальносуспільних інтересів у процесі функціонування ринку електричної енергії, згідно з яким встановлено нові фіксовані ціни на електричну енергію для побутових споживачів з 01.06.2024 по 30.04.2025, зокрема виділено в окрему категорію індивідуальних та колективних побутових споживачів, які проживають в житлових будинках (у тому числі в житлових будинках готельного типу, квартирах), обладнаних в установленому порядку електроопалювальними установками, із диференціацією ціни в опалювальний та неопалювальний період залежно від обсягів споживання.

Для того, аби скористатися можливістю оплати за зниженою вартістю, цій категорії споживачів необхідно підтвердити введення в експлуатацію електроопалювальної установки в установленому порядку. З цією метою підготовлено Протокол узгоджувальної наради щодо визначення порядку обладнання споживачами житлових будинків електроопалювальними установками від 21.06.24 № 77/1-п (далі - Протокол).

ПАТ «Черкасиобленерго» розміщує Додаток до Протоколу узгоджувальної наради щодо визначення порядку обладнання побутовими споживачами житлових будинків електроопалювальними установками № 77/1-П від 21.06.2024 та відповідно сам алгоритм дій, які має виконати споживач, аби скористатися можливістю платити менше за електроенергію взимку. 

Ознайомитися з Додатком до Протоколу можна на сайті Товариства за посиланням ➡️ https://cherkasyoblenergo.com/news/3416`,

    expectedResult: null,
  },
  {
    // message with queue hours stats
    messageNumber: 3,
    message: `Відповідно до команди НЕК «Укренерго», 26 вересня з 05:00 до 24:00 по Черкаській області будуть застосовані графіки погодинних відключень (ГПВ).

Години відсутності електропостачання:

05:00-06:00  1 черги
06:00-07:00  1 черги
07:00-08:00  2 черги
08:00-09:00  2 черги
09:00-10:00  3 черги
10:00-11:00  3 черги
11:00-12:00  4 черги
12:00-13:00  4 черги
13:00-14:00  5 та 6 черги
14:00-15:00  5 та 6 черги
15:00-16:00  2 та 3 черги
16:00-17:00  2 та 3 черги
17:00-18:00  4 та 5 черги
18:00-19:00  4 черги
19:00-20:00  6 черги
20:00-21:00  1 та 6 черги
21:00-22:00  1 та 2 черги
22:00-23:00  2 та 5 черги
23:00-24:00  5 черга

Загальна кількість годин знеструмлення по кожній черзі графіків погодинних відключень з початку місяця:

1 черга – 242 годин
2 черга – 244 годин
3 черга – 241 годин
4 черга – 241 годин
5 черга – 242 годин
6 черга – 241 годин

Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
    expectedResult: {
      eventsList: [
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '07:00',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '05:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '22:00',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '20:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '09:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '07:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '17:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '15:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '23:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '21:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '11:00',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '09:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '17:00',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '15:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '13:00',
          provider: 'CHERKOE',
          queue: '4',
          startTime: '11:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '19:00',
          provider: 'CHERKOE',
          queue: '4',
          startTime: '17:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '15:00',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '13:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '18:00',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '17:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '24:00',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '22:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '15:00',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '13:00',
        },
        {
          date: '2024-09-26',
          electricity: 'off',
          endTime: '21:00',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '19:00',
        },
      ],
      targetDate: '2024-09-26',
    },
  },
  {
    //message with schedule update
    messageNumber: 4,
    message: `Відповідно до команди НЕК «Укренерго», 24 вересня по Черкаській області до 16:00 скасовано графіки погодинних відключень. Графік діятиме з 16:00.

Години відсутності електропостачання

16:00-17:00  6 черга
17:00-18:00  6 черга
18:00-19:00  1 черга
19:00-20:00  1 черга
20:00-21:00  2 та 3 черги
21:00-22:00  2 та 3 черги
22:00-23:00  5 черга
23:00-24:00  5 черга

Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
    expectedResult: {
      eventsList: [
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '20:00',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '18:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '22:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '20:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '22:00',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '20:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '24:00',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '22:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '18:00',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '16:00',
        },
      ],
      targetDate: '2024-09-24',
    },
  },
  {
    // regular message
    messageNumber: 5,
    message: `Графіки погодинних відключень на 24 вересня

Години відсутності електропостачання

00:00-01:00  6 та 1 черги
01:00-02:00  6 та 1 черги
02:00-03:00  2 та 3 черги
03:00-04:00  2 та 3 черги
04:00-05:00  4 та 5 черги
05:00-06:00  4 та 5 черги
06:00-07:00  6 та 1 черги
07:00-08:00  6 та 1 черги
08:00-09:00  2 черга
09:00-10:00  2 черга
10:00-11:00  3 черга
11:00-12:00  3 черга
12:00-13:00  4 черга
13:00-14:00  4 черга
14:00-15:00  5 черга
15:00-16:00  5 черга
16:00-17:00  6 черга
17:00-18:00  6 черга
18:00-19:00  1 черга
19:00-20:00  1 черга
20:00-21:00  2 та 3 черги
21:00-22:00  2 та 3 черги
22:00-23:00  5 черга
23:00-24:00  5 черга

Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
    expectedResult: {
      eventsList: [
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '02:00',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '00:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '08:00',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '06:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '20:00',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '18:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '04:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '02:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '10:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '08:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '22:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '20:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '04:00',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '02:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '12:00',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '10:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '22:00',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '20:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '06:00',
          provider: 'CHERKOE',
          queue: '4',
          startTime: '04:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '14:00',
          provider: 'CHERKOE',
          queue: '4',
          startTime: '12:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '06:00',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '04:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '16:00',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '14:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '24:00',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '22:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '02:00',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '00:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '08:00',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '06:00',
        },
        {
          date: '2024-09-24',
          electricity: 'off',
          endTime: '18:00',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '16:00',
        },
      ],
      targetDate: '2024-09-24',
    },
  },
  {
    // message with a line break in between the queues lines
    messageNumber: 6,
    message: `20 вересня з 00:00 до 02:00 та 05:00 до 24:00 по Черкаській області будуть застосовані графіки погодинних відключень (ГПВ). 

З 02:00 до 05:00 графіки погодинних відключень (ГПВ) застосовуватися не будуть.

Години відсутності електропостачання:

00:00-01:00  2 черги
01:00-02:00  2 черги

05:00-06:00  6 черги
06:00-07:00  6 черги
07:00-08:00  1 черги
08:00-09:00  1 черги
09:00-10:00  2 черги
10:00-11:00  2 черги
11:00-12:00  3 черги
12:00-13:00  3 черги
13:00-14:00  4 та 5 черги
14:00-15:00  4 та 5 черги
15:00-16:00  6 та 1 черги
16:00-17:00  6 та 1 черги
17:00-18:00  2 та 3 черги
18:00-19:00  2 та 3 черги
19:00-20:00  4 та 5 черги
20:00-21:00  4 та 5 черги
21:00-22:00  6 та 1 черги
22:00-23:00  6 та 1 черги
23:00-24:00  2 та 3 черга`,
    expectedResult: {
      eventsList: [
        {
          date: '2024-09-20',
          electricity: 'off',
          endTime: '09:00',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '07:00',
        },
        {
          date: '2024-09-20',
          electricity: 'off',
          endTime: '17:00',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '15:00',
        },
        {
          date: '2024-09-20',
          electricity: 'off',
          endTime: '23:00',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '21:00',
        },
        {
          date: '2024-09-20',
          electricity: 'off',
          endTime: '02:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '00:00',
        },
        {
          date: '2024-09-20',
          electricity: 'off',
          endTime: '11:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '09:00',
        },
        {
          date: '2024-09-20',
          electricity: 'off',
          endTime: '19:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '17:00',
        },
        {
          date: '2024-09-20',
          electricity: 'off',
          endTime: '24:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '23:00',
        },
        {
          date: '2024-09-20',
          electricity: 'off',
          endTime: '13:00',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '11:00',
        },
        {
          date: '2024-09-20',
          electricity: 'off',
          endTime: '19:00',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '17:00',
        },
        {
          date: '2024-09-20',
          electricity: 'off',
          endTime: '24:00',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '23:00',
        },
        {
          date: '2024-09-20',
          electricity: 'off',
          endTime: '15:00',
          provider: 'CHERKOE',
          queue: '4',
          startTime: '13:00',
        },
        {
          date: '2024-09-20',
          electricity: 'off',
          endTime: '21:00',
          provider: 'CHERKOE',
          queue: '4',
          startTime: '19:00',
        },
        {
          date: '2024-09-20',
          electricity: 'off',
          endTime: '15:00',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '13:00',
        },
        {
          date: '2024-09-20',
          electricity: 'off',
          endTime: '21:00',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '19:00',
        },
        {
          date: '2024-09-20',
          electricity: 'off',
          endTime: '07:00',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '05:00',
        },
        {
          date: '2024-09-20',
          electricity: 'off',
          endTime: '17:00',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '15:00',
        },
        {
          date: '2024-09-20',
          electricity: 'off',
          endTime: '23:00',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '21:00',
        },
      ],
      targetDate: '2024-09-20',
    },
  },
  {
    // regular message
    messageNumber: 7,
    message: `Графіки погодинних відключень на 19 вересня

Години відсутності електропостачання

00:00-01:00  1 та 6 черги
01:00-02:00  1 та 6 черги
02:00-03:00  2 та 4 черги
03:00-04:00  2 та 4 черги
04:00-05:00  5 та 6 черги
05:00-06:00  5 та 6 черги
06:00-07:00  3 та 4 черги
07:00-08:00  3 та 4 черги
08:00-09:00  5 та 6 черги
09:00-10:00  1, 5 та 6 черги
10:00-11:00  1, 4 та 3 черги
11:00-12:00  2, 3 та 4 черги
12:00-13:00  2, 5 та 6 черги
13:00-14:00  1, 5 та 6 черги
14:00-15:00  1, 4 та 3 черги
15:00-16:00  2, 3 та 4 черги
16:00-17:00  2, 5 та 6 черги
17:00-18:00  1, 5 та 6 черги
18:00-19:00  1, 4 та 3 черги
19:00-20:00  2, 3 та 4 черги
20:00-21:00  2, 5 та 6 черги
21:00-22:00  1, 5 та 6 черги
22:00-23:00  1, 3 та 4 черги
23:00-24:00  2 та 3 черга

Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
    expectedResult: {
      eventsList: [
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '02:00',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '00:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '11:00',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '09:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '15:00',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '13:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '19:00',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '17:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '23:00',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '21:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '04:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '02:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '13:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '11:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '17:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '15:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '21:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '19:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '24:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '23:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '08:00',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '06:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '12:00',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '10:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '16:00',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '14:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '20:00',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '18:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '24:00',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '22:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '04:00',
          provider: 'CHERKOE',
          queue: '4',
          startTime: '02:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '08:00',
          provider: 'CHERKOE',
          queue: '4',
          startTime: '06:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '12:00',
          provider: 'CHERKOE',
          queue: '4',
          startTime: '10:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '16:00',
          provider: 'CHERKOE',
          queue: '4',
          startTime: '14:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '20:00',
          provider: 'CHERKOE',
          queue: '4',
          startTime: '18:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '23:00',
          provider: 'CHERKOE',
          queue: '4',
          startTime: '22:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '06:00',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '04:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '10:00',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '08:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '14:00',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '12:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '18:00',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '16:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '22:00',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '20:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '02:00',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '00:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '06:00',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '04:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '10:00',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '08:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '14:00',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '12:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '18:00',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '16:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '22:00',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '20:00',
        },
      ],
      targetDate: '2024-09-19',
    },
  },
  {
    messageNumber: 8,
    message: `Оновлені графіки погодинних відключень на 29 вересня 
 
29 вересня з 18:00 до 23:00 по Черкаській області будуть застосовані графіки погодинних відключень (ГПВ). 
 
Години відсутності електропостачання: 
 
18:00-19:00 2 черга 
19:00-20:00 2 черга 
20:00-21:00 5 черга 
21:00-22:00 5 черга 
22:00-23:00 3 черга 
 
Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
    expectedResult: {
      eventsList: [
        {
          date: '2024-09-29',
          electricity: 'off',
          endTime: '20:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '18:00',
        },
        {
          date: '2024-09-29',
          electricity: 'off',
          endTime: '23:00',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '22:00',
        },
        {
          date: '2024-09-29',
          electricity: 'off',
          endTime: '22:00',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '20:00',
        },
      ],
      targetDate: '2024-09-29',
    },
  },
  // {
  //   messageNumber: 9,
  //   message: ``,
  //   expectedResult: [],
  // },
  // {
  //   messageNumber: 10,
  //   message: ``,
  //   expectedResult: [],
  // },
];

export const messagesWithMinutes: TestMessageData[] = [
  {
    messageNumber: 1,
    message: `Графіки погодинних відключень на 19 вересня

Години відсутності електропостачання

00:03-01:13  1 та 6 черги
01:13-02:22  1 та 6 черги
02:22-03:59  2 та 4 черги
03:59-04:59  2 та 4 черги
04:59-05:08  5 та 6 черги
05:08-06:30  5 та 6 черги
06:30-07:00  3 та 4 черги
07:00-08:21  3 та 4 черги
08:21-09:00  5 та 6 черги
09:00-09:59  1, 5 та 6 черги
09:59-11:03  1, 4 та 3 черги
11:03-12:00  2, 3 та 4 черги
12:00-13:00  2, 5 та 6 черги

Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
    expectedResult: {
      eventsList: [
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '02:22',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '00:03',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '11:03',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '09:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '04:59',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '02:22',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '13:00',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '11:03',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '08:21',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '06:30',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '12:00',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '09:59',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '04:59',
          provider: 'CHERKOE',
          queue: '4',
          startTime: '02:22',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '08:21',
          provider: 'CHERKOE',
          queue: '4',
          startTime: '06:30',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '12:00',
          provider: 'CHERKOE',
          queue: '4',
          startTime: '09:59',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '06:30',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '04:59',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '09:59',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '08:21',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '13:00',
          provider: 'CHERKOE',
          queue: '5',
          startTime: '12:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '02:22',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '00:03',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '06:30',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '04:59',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '09:59',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '08:21',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '13:00',
          provider: 'CHERKOE',
          queue: '6',
          startTime: '12:00',
        },
      ],
      targetDate: '2024-09-19',
    },
  },
  {
    messageNumber: 2,
    message: `Оновлені графіки погодинних відключень на 19 вересня

Відповідно до команди НЕК «Укренерго», 19 вересня графіки погодинних відключень (ГПВ) будуть застосовані з 17:30 до 21:30.

Години відсутності електропостачання:

17:30-18:30 1 черга
18:30-19:30 1 черга
19:30-20:30 2 черга
20:30-21:30 2 черга

Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
    expectedResult: {
      eventsList: [
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '19:30',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '17:30',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '21:30',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '19:30',
        },
      ],
      targetDate: '2024-09-19',
    },
  },
  {
    messageNumber: 3,
    message: `Оновлені графіки погодинних відключень

Відповідно до команди НЕК «Укренерго», 19 вересня графіки погодинних відключень (ГПВ) будуть застосовані з 18:00 до 21:30.

Години відсутності електропостачання

18:00-19:00 1 черга
19:00-20:00 1 черга
20:00-21:00 2 черга
21:00-21:30 2 черга

Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
    expectedResult: {
      eventsList: [
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '20:00',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '18:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '21:30',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '20:00',
        },
      ],
      targetDate: '2024-09-19',
    },
  },
  {
    // with gaps
    messageNumber: 4,
    message: `Оновлені графіки погодинних відключень

Відповідно до команди НЕК «Укренерго», 19 вересня графіки погодинних відключень (ГПВ) будуть застосовані з 18:00 до 21:30.

Години відсутності електропостачання

18:00-19:00 1 черга
19:00-20:00 1 черга
20:00-21:00 2 черга
21:00-21:30 2 черга
21:33-22:10 3 та 4 черги

Сторінка у Telegram: t.me/pat_cherkasyoblenergo`,
    expectedResult: {
      eventsList: [
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '20:00',
          provider: 'CHERKOE',
          queue: '1',
          startTime: '18:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '21:30',
          provider: 'CHERKOE',
          queue: '2',
          startTime: '20:00',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '22:10',
          provider: 'CHERKOE',
          queue: '3',
          startTime: '21:33',
        },
        {
          date: '2024-09-19',
          electricity: 'off',
          endTime: '22:10',
          provider: 'CHERKOE',
          queue: '4',
          startTime: '21:33',
        },
      ],
      targetDate: '2024-09-19',
    },
  },
];
