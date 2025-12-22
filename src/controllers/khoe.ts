import express, { Request, Response, Router } from 'express';
import { khoeService } from '../services/khoe/khoe';

export class KhoeController {
  router: Router = express.Router();

  constructor() {
    this.router.get('/', this.healthCheck);
    this.router.get('/khoe', this.getSchedule);
  }

  async healthCheck(req: Request, res: Response) {
    res.send({ status: 'ok' });
  }

  async getSchedule(req: Request, res: Response) {
    res.send(await khoeService.getSchedule());
  }
}

export const khoe = new KhoeController();
