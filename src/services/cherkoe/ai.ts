import { GoogleGenAI } from '@google/genai';
import { IEoffEvent } from '../../common/types-and-interfaces';
import { response } from 'express';
import { Api } from 'telegram';
import messages = Api.messages;
import { CherkoeTgParser } from './cherkoe-tg-parser';
import { TotalList } from 'telegram/Helpers';
import { ISchedule } from './cherkoe';
import config from '../../config';

const ai = new GoogleGenAI({});

export class AiService {
  private ai = new GoogleGenAI({ apiKey: config.ai.geminiApiKey });

  generateTaskForAi = (messages: TotalList<Api.Message>) => {
    return `I have an array of messages from Черкасиобленерго.
    Each message contains some data, but only some messages contains the data for our Hourly Cutoffs Schedules, 
    which is called in ukrainian Графіки Погодинних Відключень(ГПВ), also, all schedule message includes the number of the queue and the number of subqueue,
    it can be 2.1 or 2.II or different format, queues are 1.1 - 6.2 .
    also, schedule message contains a time of cutoffs for every queue which were mentioned in it.
    From all of the messages in the array, please pick latest message which is related to Hourly cutoffs for TODAY and TOMORROW,
    parse all queues mentioned in it, and time for cutoffs for every queue.
    All events which time is "side by side" one to other for the same queue, should be united into one time interval.
    for each queue and each its interval please provide an object in the following format:
    {
"queue": "5.2",
"date": "2025-10-22",
"electricity": "off",
"provider": "CHERKOE",
"startTime": "17:30",
"endTime": "19:30"
}

interface EoffEvent {
  startTime: string; // e.g. "18:00"
  endTime: string; // e.g. "18:00"
  queue: string; // e.g. "2"
  date: string; // e.g. "2024-09-02"
  electricity: string; // "on"/"off"
  provider: string; // "CHERKOE"
}

interface ISchedule {
  events: IEoffEvent[];
  hasTodayData: boolean;
  hasTomorrowData: boolean;
}

and unite all the objects to one array.
I need a result as an object with props:
events - array of all cutoff events described above
hasTodayData - boolean, indicates if an array has data for today events
hasTomorrowData - boolean, indicates if an array has data for tomorrow events.
Please, find the array of input messages below: ${messages}
`;
  };

  getAiAnswer = async (contents: string): Promise<any> => {
    // console.log('models_list', this.ai.ListModels);
    // const model = this.ai.models.generateContent({ model: 'gemini-2.5-flash' });
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
    });
    // console.log(response.text);

    console.log(JSON.stringify(response, null, 2));
  };

  convertMessagesToEvents = async (messages: TotalList<Api.Message>): Promise<ISchedule> => {
    const preparedInstructions = this.generateTaskForAi(messages);

    const aiResponse = await this.getAiAnswer(preparedInstructions);

    return aiResponse;
  };
}

export const aiService = new AiService();
