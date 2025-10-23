import { regularMessages, messagesWithMinutes } from './stubs/messages';
import { CherkoeTgParser } from '../../../services/cherkoe/cherkoe-tg-parser';
import * as utilsModule from '../../../services/cherkoe/utils';
import { MONTH_NAMES } from '../../../services/cherkoe/utils';
import { cherkoeService } from '../../../services/cherkoe/cherkoe';

const sut = new CherkoeTgParser();

describe('LocalRun', () => {
  it(`Run Locally`, async () => {
    const result = await cherkoeService.getSchedule();
    console.log('scv_result', JSON.stringify(result, null, 2));
    expect(1).toEqual(1);
  });
});
