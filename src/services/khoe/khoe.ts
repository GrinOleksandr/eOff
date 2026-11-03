import { KhoeNewsItem } from '../../common/types-and-interfaces';
import { khoeParser } from './khoe-parser';
import { khoeApi } from './khoe-api';
import { getTargetDate, log } from '../../common/utils';
import { getChannelMessages } from '../../common/telegram';
import { IChannelMessage } from '../../common/emergency';
import config from '../../config';

export class KhoeService {
  constructor() {}

  // Emergency cutoffs (ГАВ) are posted only in Telegram. A Telegram outage must not break the hourly schedule.
  async getEmergencyMessages(): Promise<IChannelMessage[]> {
    try {
      return await getChannelMessages(config.telegram.khoeChannel);
    } catch (e: any) {
      log('khoe_emergency_messages_failed', e?.message);
      return [];
    }
  }

  async getSchedule() {
    const [allNews, emergencyMessages] = await Promise.all([
      khoeApi.fetchAllNewsHeaders(),
      this.getEmergencyMessages(),
    ]);

    const formattedNews: KhoeNewsItem[] = allNews.map((item) => ({
      ...item,
      targetDate: getTargetDate(item.title),
    }));

    const filteredNews = khoeParser.filterOnlyTodayAndTomorrowNews(formattedNews);
    log('filteredNews', filteredNews);
    const enrichedNews = await khoeApi.injectNewsDetails(filteredNews);
    log('enrichedNews', enrichedNews);

    return khoeParser.convertNewsToEvents(enrichedNews, emergencyMessages);
  }
}

export const khoeService = new KhoeService();
