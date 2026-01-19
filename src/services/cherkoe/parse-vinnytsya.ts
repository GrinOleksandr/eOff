import axios from 'axios';

const FLARESOLVERR_URL = process.env.FLARESOLVERR_URL || 'https://eoff-fs.onrender.com/v1';
const VOE_URL = 'https://www.voe.com.ua/disconnection/detailed';

export async function scrapeVOE(): Promise<string> {
  const { data } = await axios.post(FLARESOLVERR_URL, {
    cmd: 'request.get',
    url: VOE_URL,
    maxTimeout: 120000,
    session: 'voe-disconnection', // use this to make solving faster - first solve is slow, but all next are fast
  });

  if (data.status !== 'ok') {
    throw new Error(`FlareSolverr failed: ${data.message}`);
  }

  return data.solution.response;
}
