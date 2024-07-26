import 'dotenv/config';
import { StringSession } from 'telegram/sessions/index.js';

const config = {
  providerName: process.env.PROVIDER_NAME,
  telegram: {
    apiId: parseInt(process.env.TELEGRAM_APP_ID || ''),
    apiHash: process.env.TELEGRAM_API_HASH,
    stringSession: new StringSession(process.env.TELEGRAM_SESSION_STRING || ''), // Empty string for new session
    channelUsername: process.env.TELEGRAM_TARGET_CHANNEL_NAME, //channel to listen
    MESSAGES_LIMIT: parseInt(process.env.MESSAGES_LIMIT) || 20,
  },
};

export default config;
