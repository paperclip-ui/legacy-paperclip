import { EngineDelegate } from "paperclip";
import { createMockEngine } from "paperclip/lib/test/utils";
import { IntermediateCompiler } from "..";

[
  [
    `It can compile a simple PC template`,
    {
      "/entry.pc": `
        <div>
          <style>
            
          </style>
        </div>
      `
    }
  ]
].forEach(([title, source, output]: any) => {
  it(title, () => {
    const engine: EngineDelegate = createMockEngine(source);
    const compiler = new IntermediateCompiler(engine);
    const module = compiler.parseFile("/entry.pc");
    console.log(module);
  });
});
