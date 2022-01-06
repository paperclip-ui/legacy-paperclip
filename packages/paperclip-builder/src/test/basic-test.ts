import { expect } from "chai";
import { saveTmpFixtureFiles } from "./utils";

describe(__filename + "#", () => {
  it(`Throws an error if no target compiler is found`, async () => {
    const tmp = saveTmpFixtureFiles(`throws-error-test`, {
      "src/test.pc": "Hello",
      "paperclip.config.json": JSON.stringify({
        compilerOptions: {
          target: "does-not-exist"
        }
      })
    });
    const e = await tmp.buildFiles().catch(e => e);
    expect(e?.message).to.eql(
      `Paperclip compiler target "does-not-exist" not found`
    );
  });
});
