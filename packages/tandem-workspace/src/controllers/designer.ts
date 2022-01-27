import express from "express";
import * as path from "path";
import * as fs from "fs";

const DESIGNER_DIST_PATH = path.join(
  path.dirname(require.resolve("@tandem-ui/designer")),
  "..",
  "dist"
);

// simple assertion - this must exist
if (fs.lstatSync) {
  fs.lstatSync(path.join(DESIGNER_DIST_PATH, "index.html"));
}

export class Designer {
  constructor(private _express: express.Express) {
    this._installRoutes();
  }

  private _installRoutes() {
    // static front-end
    this._express.use(express.static(DESIGNER_DIST_PATH));
  }
}
