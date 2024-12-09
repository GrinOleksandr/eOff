import express, { Request, Response, Router } from 'express';
import { cherkoeService } from '../services/cherkoe/cherkoe';

export class CherkoeController {
  router: Router = express.Router();

  constructor() {
    this.router.get('/', this.healthCheck);
    this.router.get('/cherkoe', this.getSchedule);
    this.router.get('/cherkoe/message', this.getMessage);
  }

  async healthCheck(req: Request, res: Response) {
    res.send({ status: 'ok' });
  }

  async getSchedule(req: Request, res: Response) {
    res.send(await cherkoeService.getSchedule());
  }

  async getMessage(req: Request, res: Response) {
    console.log(req.query);
    res.send(
      await cherkoeService.getMessage(
        req.query?.type?.toString() || 'new',
        req.query.queue?.toString() || '1',
        req.query?.day?.toString() || 'today'
      )
    );
  }
}

export const cherkoeController = new CherkoeController();
