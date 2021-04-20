import { expect } from "chai";
import {
  LoadedPCData,
  PCExports,
  DependencyNodeContent
} from "paperclip-utils";
import { createMockEngine } from "../utils";

describe(__filename + "#", () => {
  it("Maintains raws for elements", async () => {
    const graph = {
      "/entry.pc": `\n<div></div>`
    };
    const engine = await createMockEngine(graph);
    await engine.open("/entry.pc");

    const result = (await engine.getLoadedAst(
      "/entry.pc"
    )) as DependencyNodeContent;
    expect(result).to.eql({
      contentKind: "Node",
      kind: "Fragment",
      location: {
        start: 0,
        end: 12
      },
      children: [
        {
          kind: "Element",
          id: "0",
          raws: {
            before: "\n"
          },
          location: {
            start: 1,
            end: 12
          },
          openTagLocation: {
            start: 1,
            end: 6
          },
          tagNameLocation: {
            start: 2,
            end: 5
          },
          tagName: "div",
          attributes: [],
          children: []
        }
      ]
    });
  });
});
