import express               from "express";
import { getDataForCherkOE } from './cherkoe/service.js'

const eOffRouter = express.Router();

eOffRouter.get("/cherkoe", async (req, res) => {
  console.log("Getting electricity schedule for cherkoe");
  res.send(await getDataForCherkOE());
});

eOffRouter.get("/", async (req, res) => {
  res.send({ status: "ok" });
});

export { eOffRouter };
