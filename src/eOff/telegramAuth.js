import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import input from 'input';
import config from '../config.js'

const apiId = 'YOUR_API_ID'; // Replace with your actual api_id
const apiHash = 'YOUR_API_HASH'; // Replace with your actual api_hash
const stringSession = new StringSession(''); // Empty string to start with a new session

(async () => {
  const client = new TelegramClient(config.telegram.stringSession, config.telegram.apiId, config.telegram.apiHash, {
    connectionRetries: 5,
  });

  try {
    await client.start({
      phoneNumber: await input.text('Please enter your phone number: '),
      password: async () => await input.text('Please enter your password: '),
      phoneCode: async () => await input.text('Please enter the code you received: '),
      onError: (err) => console.log(err),
    });

    console.log('You are now connected.');
    console.log(`Session string: ${client.session.save()}`);
  } catch (error) {
    console.error('Error starting Telegram client:', error);
  }
})();
