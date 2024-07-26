import express from 'express';
import { eOffRouter } from './eOff/router.js';
import cors from 'cors';
import { getTelegramClient } from './eOff/cherkoe/utils.js';

const port = 8000;
const app = express();

(async () => {
  await getTelegramClient();
})();
app.use(cors());
app.use(eOffRouter);

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
