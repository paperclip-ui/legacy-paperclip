import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import { expect } from "chai";
import { TEST_FIXTURE_SRC_DIRECTORY } from "../utils";
import { resolveAllPaperclipFiles } from "../../core/utils";
import { resolveImportUri } from "paperclip-utils";

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
      "@nested/in/a/folder/src/imp-mod-a.pc",
      "@nested/in/a/folder/src/module.pc",
      "@nested/in/a/folder/src/test.pc",
      "module-a/src/component.pc",
      "module-a/src/module.pc",
      "module-a/src/test.pc"
    ]);
  });

  it("traverses parent to resolve module", async () => {
    const outputPath = resolveImportUri(fs)(
      path.join(
        TEST_FIXTURE_SRC_DIRECTORY,
        "../modules/@nested/in/a/folder/src/imp-mod-a.pc"
      ),
      "module-a/src/module.pc"
    );

    expect(outputPath).to.contain("modules/module-a/src/module.pc");
  });
});
