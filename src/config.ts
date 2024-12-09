import 'dotenv/config';
import { StringSession } from 'telegram/sessions/index.js';
import { IConfig } from './common/types-and-interfaces';

const config: IConfig = {
  telegram: {
    apiId: parseInt(process.env.TELEGRAM_APP_ID || ''),
    apiHash: process.env.TELEGRAM_API_HASH || '',
    stringSession: new StringSession(process.env.TELEGRAM_SESSION_STRING || ''), // Empty string for new session
    cherkoeChannel: process.env.TELEGRAM_CHERKOE_CHANNEL_NAME || 'pat_cherkasyoblenergo', //channel to listen
    MESSAGES_LIMIT: parseInt(process.env.MESSAGES_LIMIT || '') || 30,
  },
};

export default config;
