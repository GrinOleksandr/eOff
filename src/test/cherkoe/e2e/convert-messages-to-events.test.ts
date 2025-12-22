import {
  onlyInitialScheduleMessage,
  firstUpdatedScheduleMessage,
  secondUpdatedScheduleMessage,
  resultAfterInitialMessage,
  resultAfterFirstUpdate,
  resultAfterSecondUpdate,
} from './stubs/messages-to-convert-2';
import * as parserModule from '../../../services/cherkoe/cherkoe-tg-parser';
import * as utilsModule from '../../../common/utils';
import { MONTH_NAMES } from '../../../common/utils';

const sut = new parserModule.CherkoeTgParser();

const time1 = utilsModule.toKyivDate('2025-10-22 14:25:00');
// const newK = utilsModule.toKyivDate('2024-09-04 12:00:00');

describe('Convert messages to events(:00 minutes)', () => {
  it(`Should parse initial schedule-message`, async () => {
    jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({ index: 9, name: MONTH_NAMES[8], year: 2025 });
    jest.spyOn(utilsModule, 'getNewKyivDate').mockReturnValue(time1);
    jest // @ts-ignore
      .spyOn(utilsModule, 'getTodayAndTomorrowDate') // @ts-ignore
      .mockReturnValue({ todayDate: '2025-09-04', tomorrowDate: '2025-09-05' });

    // @ts-ignore
    const parsedMessage: ISchedule = sut.convertMessagesToEvents([onlyInitialScheduleMessage]);

    expect(parsedMessage).toEqual(resultAfterInitialMessage);
  });

  //this is planned test to handle schedule updates
  // it(`Should parse after 1 update`, async () => {
  //   jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({ index: 9, name: MONTH_NAMES[8], year: 2024 });
  //   jest.spyOn(utilsModule, 'getNewKyivDate').mockReturnValue(utilsModule.toKyivDate('2024-09-04 08:51:00'));
  //   jest
  //     .spyOn(utilsModule, 'getTodayAndTomorrowDate')
  //     .mockReturnValue({ todayDate: '2024-09-04', tomorrowDate: '2024-09-05' });
  //
  //   const parsedMessage: ISchedule = sut.convertMessagesToEvents([
  //     // @ts-ignore
  //     onlyInitialScheduleMessage,
  //     // @ts-ignore
  //     firstUpdatedScheduleMessage,
  //   ]);
  //
  //   expect(parsedMessage).toEqual(resultAfterFirstUpdate);
  // });
  //   //this is planned test to handle schedule updates
  // it(`Should parse after 2 update`, async () => {
  //   jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({ index: 9, name: MONTH_NAMES[8], year: 2024 });
  //   jest.spyOn(utilsModule, 'getNewKyivDate').mockReturnValue(utilsModule.toKyivDate('2024-09-04 10:17:33'));
  //   jest
  //     .spyOn(utilsModule, 'getTodayAndTomorrowDate')
  //     .mockReturnValue({ todayDate: '2024-09-04', tomorrowDate: '2024-09-05' });

  //   const parsedMessage: ISchedule = sut.convertMessagesToEvents([
  //     // @ts-ignore
  //     onlyInitialScheduleMessage,
  //     // @ts-ignore
  //     firstUpdatedScheduleMessage,
  //     // @ts-ignore
  //     secondUpdatedScheduleMessage,
  //   ]);
  //
  //   expect(parsedMessage).toEqual(resultAfterSecondUpdate);
  // });
});

//      '09:00-11:00-2' => {
//         queue: '2',
//         date: '2024-09-04',
//         electricity: 'off',
//         provider: 'CHERKOE',
//         startTime: '09:00',
//         endTime: '11:00'
//       },
