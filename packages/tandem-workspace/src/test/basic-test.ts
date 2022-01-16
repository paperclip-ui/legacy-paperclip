import { expect } from "chai";
import { start } from "../server";

describe(__filename + "#", () => {
  it(`Can spin up a simple workspace`, async () => {
    const server = await start({ pause: false });
  });
});
