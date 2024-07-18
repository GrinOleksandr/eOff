import express             from "express";
import { eOffRouter } from "./eOff/router.js";
import cors                from "cors"

const port = 8000;
const app = express();

app.use(cors())
app.use(eOffRouter);

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
