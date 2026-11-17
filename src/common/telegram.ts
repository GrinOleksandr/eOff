import config from '../config';
import { getTelegramClient } from './utils';
import { TotalList } from 'telegram/Helpers';
import { Api } from 'telegram';
import { EntityLike } from 'telegram/define';
import * as cheerio from 'cheerio';

async function getMessagesByTelegramClient(channel: EntityLike): Promise<TotalList<Api.Message>> {
  const client = await getTelegramClient();

  // Getting the channel entity
  const channelEntity = await client.getEntity(channel);

  const messages = await client.getMessages(channelEntity, {
    limit: config.telegram.MESSAGES_LIMIT,
  });

  return messages.reverse();
}

async function getMessagesByTelegramWebsite(channel: EntityLike): Promise<TotalList<Api.Message>> {
  // @ts-ignore
  const channelUsername = channel.replace('@', '');
  const url = `https://t.me/s/${channelUsername}`;

  try {
    console.log('scv_parsing_response', url);
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

    // Limit to configured number of messages; page is oldest→newest, so keep the newest
    const limitedMessages = messages.slice(-config.telegram.MESSAGES_LIMIT);

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

export async function getChannelMessages(channel: EntityLike): Promise<TotalList<Api.Message>> {
  if (config.telegram.messageSource === 'TG_CLIENT') {
    return getMessagesByTelegramClient(channel);
  }

  if (config.telegram.messageSource === 'TG_WEBSITE') {
    return getMessagesByTelegramWebsite(channel);
  }

  return [] as unknown as TotalList<Api.Message>;
}
