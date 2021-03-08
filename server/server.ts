require("dotenv").config();

import next from "next";
import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRouter from "./authRouter";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const app: Application = express();

    app.use(bodyParser());
    app.use(cors());

    app.use("/auth", authRouter);

    app.get("*", (req: Request, res: Response) => {
      return handle(req, res);
    });

    app.listen(3001, (err?: any): void => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${3001}`);
    });
  })
  .catch((ex: any) => {
    console.error(ex.stack);
    process.exit(1);
  });
