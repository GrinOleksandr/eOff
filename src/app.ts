import express from 'express';
import { urlencoded } from 'body-parser';
import { cherkoeController, khoeController } from './controllers';
import cors from 'cors-ts';
import helmet from 'helmet';
import morgan from 'morgan';

export class App {
  app = express();
  port = process.env.PORT || 8000;
  server: any = null;

  constructor() {
    // Set up everything synchronously in constructor
    this.useMiddlewares();
    this.useRoutes();
  }

  useRoutes() {
    // Health check for Render
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });

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

  public startServer() {
    // Only start server if NOT on Vercel
    if (process.env.VERCEL) {
      console.log('Running on Vercel - serverless mode');
      return;
    }

    // Start server for Render/local
    //@ts-ignore
    this.server = this.app.listen(this.port, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${this.port}`);
    });

    // Graceful shutdown handlers
    const shutdown = () => {
      console.log('Received kill signal, shutting down gracefully');
      if (this.server) {
        this.server.close(() => {
          console.log('Closed out remaining connections');
          process.exit(0);
        });

        setTimeout(() => {
          console.error('Could not close connections in time, forcefully shutting down');
          process.exit(1);
        }, 10000);
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }
}

// DO NOT auto-start here - let bootstrap.ts control it
