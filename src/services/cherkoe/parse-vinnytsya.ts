import axios from 'axios';

const FLARESOLVERR_URL = process.env.FLARESOLVERR_URL || 'https://eoff-fsolv.onrender.com/v1';
const VOE_URL = 'https://www.voe.com.ua/disconnection/detailed';

export async function scrapeVOE(): Promise<string> {
  const postData = new URLSearchParams({
    search_type: '0',
    city_id: '123',
    street_id: '345',
    house_id: '678',
    form_id: 'disconnection_detailed_search_form',
  }).toString();

  const { data } = await axios.post(FLARESOLVERR_URL, {
    cmd: 'request.post',
    url: VOE_URL,
    maxTimeout: 120000,
    session: 'voe-disconnection', // use this to make solving faster - first solve is slow, but all next are fast,
    postData,
  });

  if (data.status !== 'ok') {
    throw new Error(`FlareSolverr failed: ${data.message}`);
  }

  return data.solution.response;
}
