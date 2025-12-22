import express, { Request, Response, Router } from 'express';
import { khoeService } from '../services/khoe/khoe';

export class KhoeController {
  router: Router = express.Router();

  constructor() {
    this.router.get('/', this.getSchedule);
  }

  async getSchedule(req: Request, res: Response) {
    res.send(await khoeService.getSchedule());
  }
}

export const khoeController = new KhoeController();
