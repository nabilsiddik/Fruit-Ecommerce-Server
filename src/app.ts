import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { envVars } from "./app/config/env.config.js";
import { notFound } from "./app/middleware/notFound.js";
import globalErrorHandler from "./app/middleware/globalErrorHandler.js";
import { router } from "./app/router/index.js";

export const app = express();

const startApp = async () => {
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.use(
    cors({
      origin: [envVars.CLIENT_URL, "http://localhost:3000"],
      credentials: true,
    }),
  );
  app.use(cookieParser());

  app.use("/api/v1", router);

  app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({
      message: `Server is running on port ${envVars.PORT}`,
    });
  });

  app.get("/", (req, res) => {
    res.json({ message: `App is running or port ${envVars.PORT}` });
  })

  app.use(notFound);
  app.use(globalErrorHandler);
};

await startApp();
