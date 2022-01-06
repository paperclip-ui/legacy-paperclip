import express from "express";
import * as path from "path";

const DESIGNER_DIST_PATH = path.join(
  __dirname,
  "../../../../",
  "node_modules/@tandemui/designer/dist"
);

export class Designer {
  constructor(private _express: express.Express) {
    this._installRoutes();
  }

  private _installRoutes() {
    // static front-end
    this._express.use(express.static(DESIGNER_DIST_PATH));
  }
}
