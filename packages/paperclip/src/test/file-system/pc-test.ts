import * as path from "path";
import * as url from "url";
import { expect } from "chai";
import { createEngine } from "../../../";
import {
  stringifyLoadResult,
  TEST_FIXTURE_DIRECTORY,
  waitForError,
  noop
} from "../utils";

describe(__filename + "#", () => {
  it("Can load an entry that has an import", async () => {
    const e = await createEngine();
    const result = stringifyLoadResult(
      await e.run(
        url
          .pathToFileURL(path.join(TEST_FIXTURE_DIRECTORY, "good-import.pc"))
          .toString()
      )
    );
    expect(result.replace(/ data-pc-[^>\s]+/, "")).to.eql(
      `<style></style><div>I'm a secret! </div>`
    );
  });

  it("Won't load module src where the casing is incorrect", async () => {
    const e = await createEngine();
    const ep = waitForError(e);
    e.run(
      url
        .pathToFileURL(path.join(TEST_FIXTURE_DIRECTORY, "bad-import.pc"))
        .toString()
    ).catch(noop);
    const error = await ep;
    expect(error.errorKind).to.eql("Graph");
    expect(error.info.message).to.eql("import not found");
  });

  it("Displays an error for 404 CSS url", async () => {
    const e = await createEngine();
    let err;

    try {
      await e.run(
        url
          .pathToFileURL(path.join(TEST_FIXTURE_DIRECTORY, "bad-css-url.pc"))
          .toString()
      );
    } catch (e) {
      err = e;
    }

    expect(err).not.to.eq(null);
    expect(err.errorKind).to.eql("Runtime");
    expect(err.message).to.eql(
      "Unable to resolve file: /not/found.png from file:///Users/craigcondon/Developer/public/paperclip/packages/paperclip/test-fixtures/bad-css-url.pc"
    );
  });

  it("can resolve module using module path syntax", async () => {
    const e = await createEngine();

    const result = await e.run(
      url
        .pathToFileURL(path.join(TEST_FIXTURE_DIRECTORY, "mod-import.pc"))
        .toString()
    );

    expect(stringifyLoadResult(result).replace(/ data-pc-[^>\s]+/, "")).to.eql(
      `<style></style><div>I'm a secret! </div>`
    );
  });
});
