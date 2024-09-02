import express, { Request, Response, Router } from 'express';
import { cherkoeService } from '../services/cherkoe';

export class CherkoeController {
  router: Router = express.Router();

  constructor() {
    this.router.get('/', this.healthCheck);
    this.router.post('/cherkoe', this.getSchedule);
  }

  async healthCheck(req: Request, res: Response) {
    res.send({ status: 'ok' });
  }

  async getSchedule(req: Request, res: Response) {
    console.log('Getting electricity schedule for cherkoe');
    res.send(await cherkoeService.getSchedule());
  }
}

export const cherkoeController = new CherkoeController();
