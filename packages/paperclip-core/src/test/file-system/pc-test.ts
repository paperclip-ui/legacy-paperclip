import * as path from "path";
import * as url from "url";
import { expect } from "chai";
import { createEngineDelegate } from "../../node";
import { stringifyLoadResult, TEST_FIXTURE_SRC_DIRECTORY } from "../utils";

describe(__filename + "#", () => {
  it("Can load an entry that has an import", async () => {
    const e = createEngineDelegate();

    const result = stringifyLoadResult(
      await e.open(
        url
          .pathToFileURL(
            path.join(TEST_FIXTURE_SRC_DIRECTORY, "good-import.pc")
          )
          .toString()
      )
    );
    expect(result.replace(/ class=".*?"/g, "")).to.eql(
      `<style></style><div>I'm a secret!</div>`
    );
  });

  it("Won't load module src where the casing is incorrect", async () => {
    const e = createEngineDelegate();

    let err;
    try {
      e.open(
        url
          .pathToFileURL(path.join(TEST_FIXTURE_SRC_DIRECTORY, "bad-import.pc"))
          .toString()
      );
    } catch (e) {
      err = e;
    }

    expect(err.errorKind).to.eql("Graph");
    expect(err.info.message).to.eql("import not found");
  });

  it("Displays an error for 404 CSS url", async () => {
    const e = createEngineDelegate();
    let err;

    try {
      await e.open(
        url
          .pathToFileURL(
            path.join(TEST_FIXTURE_SRC_DIRECTORY, "bad-css-url.pc")
          )
          .toString()
      );
    } catch (e) {
      err = e;
    }

    expect(err).not.to.eq(null);
    expect(err.errorKind).to.eql("Runtime");
    expect(err.message).to.contain("Unable to resolve file: /not/found.png");
  });

  it("can resolve a pc file from a a module", async () => {
    const e = createEngineDelegate();

    const result = await e.open(
      url
        .pathToFileURL(path.join(TEST_FIXTURE_SRC_DIRECTORY, "mod-a-import.pc"))
        .toString()
    );

    expect(stringifyLoadResult(result).replace(/ class=".*?"/g, "")).to.eql(
      `<style></style><div> Some Module <div>from test.pc</div></div>`
    );
  });

  it("can resolve a pc file from a nested module", async () => {
    const e = createEngineDelegate();

    const result = await e.open(
      url
        .pathToFileURL(
          path.join(TEST_FIXTURE_SRC_DIRECTORY, "nested-mod-import.pc")
        )
        .toString()
    );

    expect(stringifyLoadResult(result).replace(/ class=".*?"/g, "")).to.eql(
      `<style></style><div> Some Module <div>from test.pc</div></div>`
    );
  });
});
