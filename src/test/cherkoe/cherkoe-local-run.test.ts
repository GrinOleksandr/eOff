import { cherkoeService } from '../../services/cherkoe/cherkoe';

describe('LocalRun', () => {
  it(`Run Locally`, async () => {
    const result = await cherkoeService.getSchedule();
    console.log('scv_result', JSON.stringify(result, null, 2));
    expect(1).toEqual(1);
  });
});
