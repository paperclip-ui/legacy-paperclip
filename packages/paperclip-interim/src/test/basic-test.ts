import { expect} from "chai";
import { createMockEngine } from "paperclip/lib/test/utils";
import { InterimCompiler } from "..";
import { stringifyInterimModule } from "./utils";

describe(__filename + "#", () => {
  [
    [
      `can convert a simple AST to a module`,
      {
        "/entry.pc": `<div export component as="Test">
        </div>`
      },
      {},
      { html: "<style></style> <div></div>" }
    ],
    [
      `Can embed assets`,
      {
        "/entry.pc": `<img export component as="Test" src="/a.svg" />`
      },
      {
        embedMaxSize: 1000
      },
      { html: "<style></style> <img src=/a.svg></img>" }
    ]
  ].forEach(([title, graph, config, expectedOutput]: any) => {
    it(title, () => {
      const engine = createMockEngine(graph);
      const interim = new InterimCompiler(engine, {
        config: {
          sourceDirectory: "/"
        }
      });
      const module = interim.parseFile("/entry.pc");
      expect(stringifyInterimModule(module)).to.eql(expectedOutput.html);
    });
  });
});