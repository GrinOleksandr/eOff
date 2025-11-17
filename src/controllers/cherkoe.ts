import express, { Request, Response, Router } from 'express';
import { cherkoeService } from '../services/cherkoe/cherkoe';
import axios from 'axios';

export class CherkoeController {
  router: Router = express.Router();

  constructor() {
    this.router.get('/', this.healthCheck);
    this.router.get('/cherkoe', this.getSchedule);
    this.router.get('/cherkoe/message', this.getMessage);
    this.router.get('/get-html', this.getHtml);
  }

  async healthCheck(req: Request, res: Response) {
    res.send({ status: 'ok' });
  }

  // @ts-ignore
  async getHtml(req: Request, res: Response) {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).send({ error: 'URL query parameter is required' });
    }

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CustomFetcher/1.0)', // Optional: Mimic a browser to avoid blocks
        },
        timeout: 10000, // 10s timeout
      });
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.send(response.data); // Sends the raw HTML content
    } catch (error) {
      console.error('Error fetching HTML:', error);
      res.status(500).send({ error: 'Failed to fetch HTML content' });
    }
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
