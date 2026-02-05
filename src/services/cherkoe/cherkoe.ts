import config from '../../config';
import { getTelegramClient, getTodayAndTomorrowDate, MONTH_NAMES } from '../../common/utils';
import { cherkoeTgParser } from './cherkoe-tg-parser';
import { TotalList } from 'telegram/Helpers';
import { Api } from 'telegram';
import { EoffEvent, ISchedule } from '../../common/types-and-interfaces';
import * as cheerio from 'cheerio';

export class CherkoeService {
  constructor() {}

  async getMessagesByTelegramClient(): Promise<TotalList<Api.Message>> {
    const client = await getTelegramClient();

    // Getting the channel entity
    const cherkoeChannel = await client.getEntity(config.telegram.cherkoeChannel);

    return client.getMessages(cherkoeChannel, {
      limit: config.telegram.MESSAGES_LIMIT,
    });
  }

  async getMessagesByTelegramWebsite(): Promise<TotalList<Api.Message>> {
    // @ts-ignore
    const channelUsername = config.telegram.cherkoeChannel.replace('@', '');
    const url = `https://t.me/s/${channelUsername}`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,uk;q=0.8,ru;q=0.7',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Telegram channel: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const messages: Api.Message[] = [];

      // Parse messages from the page
      $('.tgme_widget_message').each((index, element) => {
        const $msg = $(element);

        // Extract message ID
        const messageLink = $msg.attr('data-post');
        const messageId = messageLink ? parseInt(messageLink.split('/')[1]) : index;

        // Extract message text with preserved newlines
        const $messageText = $msg.find('.tgme_widget_message_text');

        // Replace <br> tags with newlines before extracting text
        $messageText.find('br').replaceWith('\n');

        // Get text content with preserved newlines
        let messageText = $messageText.text().trim();

        // Also handle cases where newlines might be in HTML entities
        messageText = messageText.replace(/\n\s*\n/g, '\n'); // Remove excessive newlines

        // Extract date
        const dateTime = $msg.find('.tgme_widget_message_date time').attr('datetime');
        const date = dateTime ? Math.floor(new Date(dateTime).getTime() / 1000) : Math.floor(Date.now() / 1000);

        // Create a mock Api.Message object
        const mockMessage = {
          id: messageId,
          message: messageText,
          date: date,
          peerId: null,
          fromId: null,
          fwdFrom: null,
          viaBotId: null,
          replyTo: null,
          media: null,
          replyMarkup: null,
          entities: null,
          views: null,
          forwards: null,
          replies: null,
          editDate: null,
          postAuthor: null,
          groupedId: null,
          reactions: null,
          restrictionReason: null,
          ttlPeriod: null,
        } as unknown as Api.Message;

        messages.push(mockMessage);
      });

      // Limit to configured number of messages
      const limitedMessages = messages.slice(0, config.telegram.MESSAGES_LIMIT);

      // Create a TotalList-like object
      const totalList = Object.assign(limitedMessages, {
        total: limitedMessages.length,
      }) as TotalList<Api.Message>;

      return totalList;
    } catch (error) {
      console.error('Error fetching messages from Telegram website:', error);
      // @ts-ignore
      throw new Error(`Failed to scrape Telegram channel: ${error.message}`);
    }
  }

  async getSchedule(): Promise<ISchedule> {
    let lastMessages: TotalList<Api.Message> = [];

    if (config.telegram.messageSource === 'TG_CLIENT') {
      lastMessages = await this.getMessagesByTelegramClient();
    } else if (config.telegram.messageSource === 'TG_WEBSITE') {
      lastMessages = await this.getMessagesByTelegramWebsite();
    }

    lastMessages.reverse();

    return cherkoeTgParser.convertMessagesToEvents(lastMessages);
  }

  async getMessage(type: string, queue: string, day: string): Promise<string> {
    const schedule: ISchedule = await this.getSchedule();

    const { todayDate, tomorrowDate } = getTodayAndTomorrowDate();

    const targetDate = day === 'today' ? todayDate : tomorrowDate;

    const filteredSchedule: EoffEvent[] = schedule.events.filter(
      (event) => event.queue === queue && event.date === targetDate
    );

    const preparedSchedule = filteredSchedule.map((item) => `${item.startTime} - ${item.endTime}`);

    const monthNumber: number = parseInt(targetDate.split('-')[1]);
    const month = MONTH_NAMES[monthNumber - 1];

    const dayNumber = targetDate.split('-')[2];

    return type === 'update'
      ? `(!)Оновлений графік на ${dayNumber} ${month}:<br>${preparedSchedule.join('</br>')}`
      : `(lightening)${dayNumber} ${month} відключення:<br>${preparedSchedule.join('</br>')}`;
  }
}

export const cherkoeService = new CherkoeService();
