import { scrapeVOE } from '../../services/cherkoe/parse-vinnytsya';
import { getDtekData } from '../../services/cherkoe/parse-kyiv-obl';

// 'м. Боярка', 'вул. Шевченка';

describe('LocalRun', () => {
  it(`Run Locally`, async () => {
    const result = await scrapeVOE();
    console.log('scv_result', JSON.stringify(result, null, 2));
    expect(1).toEqual(1);
  }, 180000); // Increased to 180s (3 min) for CloudFlare challenges
});

// console.log(JSON.stringify(DisconSchedule.fact, null, 2))
