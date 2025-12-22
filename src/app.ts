import express from 'express';
import { urlencoded } from 'body-parser';

import { cherkoeController } from './controllers';
import cors from 'cors-ts';
import helmet from 'helmet';
import morgan from 'morgan';

export class App {
  app = express();
  port = 9000;

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
    // try{
    //   await getTelegramClient();
    // } catch (e) {
    //   console.error('Telegram API error: ', e)
    // }

    this.useMiddlewares();
    this.useRoutes();

    // Only start the server if running locally (not on Vercel)
    if (typeof process.env.VERCEL === 'undefined') {
      this.app.listen(this.port, () => {
        console.log(`Server running on http://localhost:${this.port}`);
      });
    }
  }
}

// Instantiate and initialize the app
const appInstance = new App();
appInstance.init();

// Export the Express app instance as default for Vercel serverless runtime
export default appInstance.app;
