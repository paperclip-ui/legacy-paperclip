import express from "express";
import { Logger } from "./logger";
import * as http from "http";

export const startHTTPServer = (
  port: number,
  logger: Logger
): [express.Express, http.Server] => {
  const expressServer = express();
  const httpServer = expressServer.listen(port, `0.0.0.0`);
  logger.info(`Starting HTTP server on port ${port}`);
  return [expressServer, httpServer];
};
