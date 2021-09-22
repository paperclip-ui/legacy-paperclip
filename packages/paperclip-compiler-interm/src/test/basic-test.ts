import { expect } from "chai";
import { createMockEngine } from "paperclip/lib/test/utils";

[
  [
    `It can compile a simple PC template`,
    {
      "/entry.pc": `
        <div>
        </div>
      `
    }
  ]
].forEach(([title, source, output]: any) => {
  it(title, () => {
    const engine = createMockEngine(source);
    const sheet = engine.open("/entry.pc").sheet;
    const ast = engine.parseFile("/entry.pc");

    console.log(ast, sheet);
  });
});
