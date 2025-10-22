/** this file is run manually on a local machine to generate telegram session string,
 * then this string is taken and saved to .env file and used for authorization */

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import config from '../config';

const apiId = 23459920; // Replace with your actual api_id
const apiHash = 'b7095f3da2c7edadb11fcd95240c4067'; // Replace with your actual api_hash
const stringSession = new StringSession(''); // Empty string to start with a new session, don't edit it here

import * as readline from 'readline';

const input = {
  text: (question: string): Promise<string> => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  },
};

(async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  try {
    await client.start({
      phoneNumber: await input.text('Please enter your phone number: '), // +380....
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
