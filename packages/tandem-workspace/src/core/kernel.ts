import express from "express";
import http from "http";
import { Logger } from "@tandemui/common";
import { Designer } from "../controllers/designer";
import { RPC } from "../controllers/rpc";
import { SocketIo } from "../controllers/socket";
import { Workspace } from "../controllers/workspace";
import { Options } from "./options";

export type Kernel = {
  options: Options;
  logger: Logger;
  designer: Designer;
  sockio: SocketIo;
  rpc: RPC;
  expressServer: express.Express;
  httpServer: http.Server;
  workspace: Workspace;
};
