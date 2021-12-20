import express from "express";
import * as path from "path";
import * as http from "http";

const DESIGNER_DIST_PATH = path.join(
  __dirname,
  "../../../../",
  "node_modules/tandem-designer/dist"
);

export class Designer {
  constructor(
    private _express: express.Express,
    private _httpServer: http.Server
  ) {
    this._installRoutes();
  }

  private _installRoutes() {
    // static front-end
    this._express.use(express.static(DESIGNER_DIST_PATH));
  }
}