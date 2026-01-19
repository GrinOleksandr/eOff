import axios from 'axios';

const FLARESOLVERR_URL = 'http://localhost:8191/v1';

export async function scrapeVOE(): Promise<string> {
  const { data } = await axios.post(FLARESOLVERR_URL, {
    cmd: 'request.get',
    url: 'https://www.voe.com.ua/disconnection/detailed',
    maxTimeout: 60000,
  });

  if (data.status !== 'ok') {
    throw new Error(`FlareSolverr failed: ${data.message}`);
  }

  return data.solution.response;
}
