import {
  onlyInitialScheduleMessage,
  firstUpdatedScheduleMessage,
  secondUpdatedScheduleMessage,
  resultAfterInitialMessage,
  resultAfterFirstUpdate,
  resultAfterSecondUpdate,
} from './stubs/messages-to-convert-2';
import * as parserModule from '../../services/cherkoe-tg-parser';
import * as utilsModule from '../../common/utils';
import { MONTH_NAMES, toKyivDate } from '../../common/utils';
import { cherkoeTgParser } from '../../services/cherkoe-tg-parser';
import { from } from 'form-data';
import { utils } from 'telegram';
import { ISchedule } from '../../services/cherkoe';

const sut = parserModule.cherkoeTgParser;

const time1 = utilsModule.toKyivDate('2024-09-04 12:00:00');
// const newK = utilsModule.toKyivDate('2024-09-04 12:00:00');

describe('Convert messages to events(:00 minutes)', () => {
  it(`Should parse initial schedule-message`, async () => {
    jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({ index: 9, name: MONTH_NAMES[8], year: 2024 });
    jest.spyOn(utilsModule, 'getNewKyivDate').mockReturnValue(time1);
    jest
      .spyOn(utilsModule, 'getTodayAndTomorrowDate')
      .mockReturnValue({ todayDate: '2024-09-04', tomorrowDate: '2024-09-05' });

    // @ts-ignore
    const parsedMessage: ISchedule = sut.convertMessagesToEvents([onlyInitialScheduleMessage]);

    expect(parsedMessage).toEqual(resultAfterInitialMessage);
  });

  it(`Should parse after 1 update`, async () => {
    jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({ index: 9, name: MONTH_NAMES[8], year: 2024 });
    jest.spyOn(utilsModule, 'getNewKyivDate').mockReturnValue(utilsModule.toKyivDate('2024-09-04 08:51:00'));
    jest
      .spyOn(utilsModule, 'getTodayAndTomorrowDate')
      .mockReturnValue({ todayDate: '2024-09-04', tomorrowDate: '2024-09-05' });

    const parsedMessage: ISchedule = sut.convertMessagesToEvents([
      // @ts-ignore
      onlyInitialScheduleMessage,
      // @ts-ignore
      firstUpdatedScheduleMessage,
    ]);

    expect(parsedMessage).toEqual(resultAfterFirstUpdate);
  });

  it(`Should parse after 2 update`, async () => {
    jest.spyOn(utilsModule, 'getCurrentMonth').mockReturnValue({ index: 9, name: MONTH_NAMES[8], year: 2024 });
    jest.spyOn(utilsModule, 'getNewKyivDate').mockReturnValue(utilsModule.toKyivDate('2024-09-04 10:17:33'));
    jest
      .spyOn(utilsModule, 'getTodayAndTomorrowDate')
      .mockReturnValue({ todayDate: '2024-09-04', tomorrowDate: '2024-09-05' });

    const parsedMessage: ISchedule = sut.convertMessagesToEvents([
      // @ts-ignore
      onlyInitialScheduleMessage,
      // @ts-ignore
      firstUpdatedScheduleMessage,
      // @ts-ignore
      secondUpdatedScheduleMessage,
    ]);

    expect(parsedMessage).toEqual(resultAfterSecondUpdate);
  });
});

//      '09:00-11:00-2' => {
//         queue: '2',
//         date: '2024-09-04',
//         electricity: 'off',
//         provider: 'CHERKOE',
//         startTime: '09:00',
//         endTime: '11:00'
//       },
