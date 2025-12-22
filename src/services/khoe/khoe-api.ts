import { KhoeNewsHeaderItem, KhoeNewsItem } from '../../common/types-and-interfaces';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { log } from '../../common/utils';

const BASE_URL = 'https://www.oblenergo.kharkov.ua';

const freeProxies = [
  { host: '195.123.8.186', port: 8080 },
  { host: '91.205.172.26', port: 8080 },
  { host: '45.85.119.250', port: 80 },
  // ... add more
];

async function fetchWithProxy(url: string, proxies: any) {
  for (const proxy of proxies) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
        proxy: {
          host: proxy.host,
          port: proxy.port,
        },
        timeout: 10000,
      });
      return response;
    } catch (err) {
      console.log(`Proxy ${proxy.host}:${proxy.port} failed, trying next...`);
    }
  }
  throw new Error('All proxies failed');
}

export class KhoeApi {
  constructor() {}

  async fetchOnePageNewsHeaders(pageNumber: number): Promise<KhoeNewsHeaderItem[]> {
    const pageUrl = `${BASE_URL}/uk?page=${pageNumber}`;

    const { data: html } = await fetchWithProxy(pageUrl, freeProxies);
    const $ = cheerio.load(html);

    const news: KhoeNewsHeaderItem[] = [];

    $('.view-id-novyny .view-content tr').each((_, row) => {
      const link = $(row).find('td.views-field-title a, td.news-mobile-href a').first();
      const title = link.text().trim();
      const url = link.attr('href');

      if (title && url) {
        news.push({ title, url });
      }
    });

    return news;
  }

  async fetchAllNewsHeaders(): Promise<KhoeNewsHeaderItem[]> {
    const results = await Promise.all([
      this.fetchOnePageNewsHeaders(0),
      this.fetchOnePageNewsHeaders(1),
      this.fetchOnePageNewsHeaders(2),
    ]);

    return results.flat().sort((a, b) => {
      const idA = parseInt(a.url.match(/\d+$/)?.[0] ?? '0');
      const idB = parseInt(b.url.match(/\d+$/)?.[0] ?? '0');
      return idA - idB;
    });
  }

  async fetchOneNewsDetails(item: KhoeNewsItem) {
    const url = `${BASE_URL}${item.url}`;
    log('fetching_details', url);

    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const label_1 = 'Години відсутності електропостачання по чергам/підчергам з урахуванням часу на перемикання';

    const scheduleText = $('p')
      .filter((i, el) => $(el).text().includes(label_1))
      .next('p')
      .html()
      ?.split(/<br\s*\/?>/i)
      .map((line) => {
        return line
          .replace(/&nbsp;/gi, ' ') // &nbsp; to space
          .replace(/&amp;/gi, '&') // &amp; to &
          .replace(/&lt;/gi, '<') // &lt; to
          .replace(/&gt;/gi, '>') // &gt; to >
          .replace(/&#?\w+;/gi, '') // any remaining HTML entities
          .replace(/<[^>]*>/g, '') // strip any remaining HTML tags
          .replace(/\s+/g, ' ') // collapse multiple spaces
          .trim();
      })
      .filter((line) => line.length);

    log('scv', scheduleText);

    return {
      path: item.url,
      text: scheduleText,
    };
  }

  async injectNewsDetails(news: KhoeNewsItem[]): Promise<KhoeNewsItem[]> {
    const allDetails = await Promise.all(news.map((item) => this.fetchOneNewsDetails(item)));
    log('all_details', allDetails);
    return news.map((newsItem: KhoeNewsItem) => {
      const details = allDetails.find((detail) => detail.path === newsItem.url);
      if (details) {
        newsItem.text = details.text;
      }

      return newsItem;
    });
  }
}

export const khoeApi = new KhoeApi();
