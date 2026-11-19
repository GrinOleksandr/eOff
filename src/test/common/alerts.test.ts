import config from '../../config';
import * as utils from '../../common/utils';
import * as telegram from '../../common/telegram';
import { requireClientAuthKey, resetAuthFailures } from '../../common/clientAuth';
import { CherkoeTgParser } from '../../services/cherkoe/cherkoe-tg-parser';
import { KhoeParser } from '../../services/khoe/khoe-parser';
import { KhoeService } from '../../services/khoe/khoe';
import { regionOnly } from '../cherkoe/unit/stubs/multi-block-messages';

const fetchMock = jest.fn();
const settle = () => new Promise((resolve) => setImmediate(resolve));
const sentTexts = (): string[] => fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).text);

const mockRes = (headersSent = false) => {
  const res: any = { headersSent };
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.send = jest.fn(() => res);
  return res;
};

const mockReq = (ip: string, key?: string, ua = 'curl/8.0') => {
  const headers: Record<string, string | undefined> = { 'x-forwarded-for': `${ip}, 10.0.0.1`, 'x-api-key': key, 'user-agent': ua };
  return { get: (h: string) => headers[h.toLowerCase()], method: 'GET', originalUrl: '/cherkoe', socket: {} } as any;
};

beforeEach(() => {
  config.alerts = { botToken: 'test-token', chatId: '123' };
  fetchMock.mockReset().mockResolvedValue({ ok: true });
  global.fetch = fetchMock as any;
});

afterEach(() => {
  config.alerts = {};
  jest.restoreAllMocks();
});

describe('notifyError never rejects', () => {
  it('when fetch throws synchronously', async () => {
    fetchMock.mockImplementation(() => {
      throw new Error('boom');
    });
    await expect(utils.notifyError('sync throw')).resolves.toBeUndefined();
  });

  it('when Telegram answers with an error and reading the body fails', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, text: () => Promise.reject(new Error('body')) });
    await expect(utils.notifyError('bad body')).resolves.toBeUndefined();
  });
});

describe('withErrorAlert', () => {
  it('turns a thrown error into a 500 and one alert, without rejecting', async () => {
    const res = mockRes();
    const handler = utils.withErrorAlert('GET /test', async () => {
      throw new Error('telegram down');
    });

    await expect(handler({} as any, res)).resolves.toBeUndefined();
    await settle();

    expect(res.status).toHaveBeenCalledWith(500);
    expect(sentTexts()).toEqual(['⚠️ GET /test failed: telegram down']);
  });

  it('does not send a second response when the handler already responded', async () => {
    const res = mockRes(true);
    const handler = utils.withErrorAlert('GET /test2', async () => {
      throw new Error('after send');
    });

    await expect(handler({} as any, res)).resolves.toBeUndefined();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('leaves a working handler alone', async () => {
    const res = mockRes();
    await utils.withErrorAlert('GET /ok', async (_req, r) => r.send('fine'))({} as any, res);
    expect(res.send).toHaveBeenCalledWith('fine');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('401 alert', () => {
  const SECRET = 'secret-client-key';
  const SECRET_2 = 'second-client-key';

  beforeEach(() => {
    process.env.CLIENT_AUTH_KEY = SECRET;
    process.env.ZORESLAV_AUTH_KEY = SECRET_2;
    resetAuthFailures();
  });

  it('accepts either client key, rejects anything else', () => {
    for (const key of [SECRET, SECRET_2]) {
      const next = jest.fn();
      requireClientAuthKey(mockReq('1.2.3.4', key), mockRes(), next);
      expect(next).toHaveBeenCalledTimes(1);
    }
    expect(reject('1.2.3.4', 'secret-client-kez').status).toHaveBeenCalledWith(401);
  });

  it('an unset key var matches nothing, not an empty header', () => {
    delete process.env.ZORESLAV_AUTH_KEY;
    const next = jest.fn();
    requireClientAuthKey(mockReq('1.2.3.4', SECRET), mockRes(), next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(reject('1.2.3.4', '').status).toHaveBeenCalledWith(401);
  });

  const reject = (ip: string, key?: string, ua?: string) => {
    const res = mockRes();
    requireClientAuthKey(mockReq(ip, key, ua), res, jest.fn());
    return res;
  };

  it('sends the summary on the 11th failure, not before', async () => {
    for (let i = 0; i < 8; i++) reject('1.2.3.4', undefined, 'python-requests/2.31');
    reject('5.6.7.8', 'mistyped-real-key');
    const tenth = reject('5.6.7.8', 'mistyped-real-key');
    await settle();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(tenth.status).toHaveBeenCalledWith(401);

    reject('1.2.3.4', undefined, 'python-requests/2.31');
    await settle();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [text] = sentTexts();
    expect(text).toMatch(/auth: 11 unauthorized requests since \d{2}\.\d{2} \d{2}:\d{2}:\d{2}, 2 callers\. Muted until/);
    expect(text).toContain('1.2.3.4 — 9 req, key: missing');
    expect(text).toContain('UA: python-requests/2.31');
    expect(text).toContain('paths: GET /cherkoe');
    expect(text).toContain('5.6.7.8 — 2 req, key: wrong');
    expect(text).not.toContain('mistyped-real-key');
    expect(text.indexOf('1.2.3.4')).toBeLessThan(text.indexOf('5.6.7.8'));
  });

  it('the 11th request answers 401 only after the alert is sent', async () => {
    let release: (v: any) => void = () => {};
    fetchMock.mockImplementation(() => new Promise((resolve) => (release = resolve)));
    for (let i = 0; i < 10; i++) reject('1.2.3.4');

    const eleventh = reject('1.2.3.4');
    await settle();
    expect(eleventh.status).not.toHaveBeenCalled();

    release({ ok: true });
    await settle();
    expect(eleventh.status).toHaveBeenCalledWith(401);
  });

  it('stays muted for the rest of the window, then counts again', async () => {
    const now = Date.now();
    const clock = jest.spyOn(Date, 'now').mockReturnValue(now);
    for (let i = 0; i < 50; i++) reject('9.9.9.9');
    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    clock.mockReturnValue(now + 3 * 60 * 60 * 1000 + 1);
    for (let i = 0; i < 10; i++) reject('9.9.9.9');
    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    reject('9.9.9.9');
    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('failures spread over more than 3h do not add up', async () => {
    const now = Date.now();
    const clock = jest.spyOn(Date, 'now').mockReturnValue(now);
    for (let i = 0; i < 10; i++) reject('1.2.3.4');
    clock.mockReturnValue(now + 3 * 60 * 60 * 1000 + 1);
    reject('1.2.3.4');
    await settle();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not record valid requests', async () => {
    const next = jest.fn();
    for (let i = 0; i < 11; i++) requireClientAuthKey(mockReq('1.2.3.4', SECRET), mockRes(), next);
    await settle();
    expect(next).toHaveBeenCalledTimes(11);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('a bug in the stats or the alert still answers 401', async () => {
    const res = mockRes();
    const req = { get: (h: string) => { if (h === 'x-forwarded-for') throw new Error('stats bug'); }, method: 'GET', socket: {} } as any;
    requireClientAuthKey(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);

    jest.spyOn(utils, 'notifyError').mockImplementation(() => {
      throw new Error('alert bug');
    });
    for (let i = 0; i < 10; i++) reject('1.2.3.4');
    const eleventh = reject('1.2.3.4');
    expect(eleventh.status).toHaveBeenCalledWith(401);
  });
});

describe('unrecognised schedule format alerts', () => {
  afterEach(() => jest.useRealTimers());

  const parseAt = (now: string, message: string) => {
    jest.useFakeTimers({ now: new Date(now) });
    const result = new CherkoeTgParser().parseMessage(message);
    jest.useRealTimers();
    return result;
  };

  it('cherkoe: alerts on a tomorrow message with time ranges but no schedule lines', async () => {
    const message = 'Графік погодинних відключень на 18 листопада\nЧерга 1.1: 00:00-02:00\nЧерга 1.2: 02:00-04:00';
    parseAt('2026-11-17T12:00:00+02:00', message);
    await settle();
    expect(sentTexts()[0]).toContain('cherkoe: message for 2026-11-18 has time ranges but no schedule lines were recognised');
  });

  it('cherkoe: no alert for a normal schedule or a dated news post without time ranges', async () => {
    parseAt('2026-11-17T12:00:00+02:00', regionOnly);
    parseAt('2026-11-17T12:00:00+02:00', '18 листопада відбудеться планове обслуговування мереж');
    await settle();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('cherkoe: no alert for a message about a date that is not today or tomorrow', async () => {
    parseAt('2026-11-17T12:00:00+02:00', 'Графік на 25 листопада\nЧерга 1.1: 00:00-02:00');
    await settle();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('khoe: alerts when schedule news has no recognisable lines', async () => {
    const targetDate = { targetDate: '2026-11-18', rawDateObj: { day: 18, year: 2026, name: 'листопада', index: 11 } };
    const news = { title: '', url: '/uk/news/12345', targetDate, text: [] } as any;
    expect(new KhoeParser().parseNewsItemText(news)).toBeNull();
    await settle();
    expect(sentTexts()[0]).toContain('khoe: schedule news for 2026-11-18 has no recognisable lines');
    expect(sentTexts()[0]).toContain('/uk/news/12345');
  });
});

describe('khoe emergency feed alert', () => {
  it('keeps the schedule working and sends one alert when Telegram fails', async () => {
    jest.spyOn(telegram, 'getChannelMessages').mockRejectedValue(new Error('tg down'));
    await expect(new KhoeService().getEmergencyMessages()).resolves.toEqual([]);
    await settle();
    expect(sentTexts()).toEqual(['⚠️ khoe: emergency (ГАВ) feed unavailable, flag is off: tg down']);
  });
});
