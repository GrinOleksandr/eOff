import { getDtekData } from '../../services/cherkoe/parse-kyiv-obl';

// 'м. Боярка', 'вул. Шевченка';

describe('LocalRun', () => {
  it(`Run Locally`, async () => {
    const result = await getDtekData('м. Боярка', 'вул. Шевченка');
    console.log('scv_result', JSON.stringify(result, null, 2));
    expect(1).toEqual(1);
  });
});
