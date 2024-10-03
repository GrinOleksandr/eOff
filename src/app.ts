import express from 'express';
import { urlencoded } from 'body-parser';

import { cherkoeController } from './controllers';
import cors from 'cors-ts';
import helmet from 'helmet';
import morgan from 'morgan';
import { getTelegramClient } from './common/utils';

export class App {
  app = express();
  port = 8000;

  constructor() {}

  useRoutes() {
    this.app.use((req: { method: string; url: any }, res: any, next: () => void) => {
      console.log(`${req.method.toUpperCase()} ${req.url}`);
      next();
    });
    this.app.use('/', cherkoeController.router);
  }

  useMiddlewares() {
    this.app.use(morgan(':date[iso] ":method :url HTTP/:http-version" :status :res[content-length]'));
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(urlencoded({ extended: true }));
  }

  public async init() {
    try{
      await getTelegramClient();
    } catch (e) {
      console.error('Telegram API error: ', e)
    }

    this.useMiddlewares();
    this.useRoutes();
    this.app.listen(this.port, () => {
      console.log(`Server running on http://localhost:${this.port}`);
    });
  }
}
