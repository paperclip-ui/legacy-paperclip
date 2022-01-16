import { expect } from "chai";
import { Server, start, Workspace } from "../server";

describe(__filename + "#", () => {
  let server: Server;

  beforeEach(async () => {
    server = await start({ pause: false, logLevel: 0 });
  });

  afterEach(async () => {
    server.stop();
  });

  it(`Can spin up a simple workspace`, async () => {});
});
