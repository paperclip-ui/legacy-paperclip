import { expect } from "chai";
import { $$buildFile } from "..";
import { createMockEngine } from "paperclip/lib/test/utils";

describe(__filename + "#", () => {
  it(`can compile a simple PC file`, () => {
    const files = $$buildFile(
      "/test.pc",
      {
        compilerOptions: { name: "paperclip-compiler-react" },
        sourceDirectory: ""
      },
      { cwd: null },
      createMockEngine({
        "/test.pc": `<div export component as="Test">
        <style>
          color: red;
        </style>
      </div>`
      })
    );

    console.log(files);
  });
});
