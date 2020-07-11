import * as path from "path";
import { expect } from "chai";
import { Engine } from "../../engine";
import {
  stringifyLoadResult,
  TEST_FIXTURE_DIRECTORY,
  waitForError
} from "../utils";

describe(__filename + "#", () => {
  it("Can load an entry that has an import", async () => {
    const e = new Engine();
    const result = stringifyLoadResult(
      await e.run(
        "file://" + path.join(TEST_FIXTURE_DIRECTORY, "good-import.pc")
      )
    );
    expect(result.replace(/ data\-pc\-[^>\s]+/, "")).to.eql(
      `<style></style><div>I'm a secret! </div>`
    );
  });

  it("Won't load module src where the casing is incorrect", async () => {
    const e = new Engine();
    const ep = waitForError(e);
    e.run(
      "file://" + path.join(TEST_FIXTURE_DIRECTORY, "bad-import.pc")
    ).catch(() => {});
    const error = await ep;
    expect(error.errorKind).to.eql("Graph");
    expect(error.info.message).to.eql("import not found");
  });
});
