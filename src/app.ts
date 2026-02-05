import express, { urlencoded } from 'express';
import { cherkoeController, khoeController } from './controllers';
import morgan from 'morgan';
import cors from 'cors-ts';
import helmet from 'helmet';

export class App {
  app = express();
  port = process.env.PORT || 9000;
  server: any = null; // Store server reference

  constructor() {}

  useRoutes() {
    this.app.use((req: { method: string; url: any }, res: any, next: () => void) => {
      console.log(`${req.method.toUpperCase()} ${req.url}`);
      next();
    });
    this.app.use('/', cherkoeController.router);
    this.app.use('/khoe', khoeController.router);
  }

  useMiddlewares() {
    this.app.use(morgan(':date[iso] ":method :url HTTP/:http-version" :status :res[content-length]'));
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(urlencoded({ extended: true }));
  }

  public async init() {
    this.useMiddlewares();
    this.useRoutes();

    // Only start the server if running locally (not on Vercel)
    if (typeof process.env.VERCEL === 'undefined') {
      //@ts-ignore
      this.server = this.app.listen(this.port, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${this.port}`);
      });

      // Graceful shutdown handler
      const shutdown = () => {
        console.log('Received kill signal, shutting down gracefully');
        this.server.close(() => {
          console.log('Closed out remaining connections');
          process.exit(0);
        });

        // Force close after 10s if not finished
        setTimeout(() => {
          console.error('Could not close connections in time, forcefully shutting down');
          process.exit(1);
        }, 10000);
      };

      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
    }
  }
}
