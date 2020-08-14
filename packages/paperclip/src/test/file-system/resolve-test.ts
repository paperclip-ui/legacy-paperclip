import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import { expect } from "chai";
import { TEST_FIXTURE_SRC_DIRECTORY } from "../utils";
import { resolveAllPaperclipFiles } from "../../utils";
import { resolveImportFile } from "paperclip-utils";

describe(__filename + "#", () => {
  it("returns nested module when resolving", async () => {
    const results = resolveAllPaperclipFiles(fs)(
      url.pathToFileURL(
        path.join(TEST_FIXTURE_SRC_DIRECTORY, "nested-mod-import.pc")
      ).href,
      true
    );
    expect(
      results.map(path => {
        return path.replace(/^\.\//, "");
      })
    ).to.eql([
      "bad-css-url.pc",
      "bad-import.pc",
      "good-import.pc",
      "hello-world.pc",
      "mod-a-import.pc",
      "mod-import.pc",
      "module.pc",
      "@nested/in/a/folder/src/component.pc",
      "@nested/in/a/folder/src/module.pc",
      "@nested/in/a/folder/src/test.pc",
      "module-a/src/component.pc",
      "module-a/src/module.pc",
      "module-a/src/test.pc"
    ]);
  });

  it("can resolve local file with the output directory", async () => {
    const outputPath = resolveImportFile(fs)(
      path.join(TEST_FIXTURE_SRC_DIRECTORY, "nested-mod-import.pc"),
      "@nested/in/a/folder/src/component.pc",
      true
    );
    expect(outputPath).to.contain(
      "test-fixtures/modules/@nested/in/a/folder/lib/component.pc"
    );
  });
});
