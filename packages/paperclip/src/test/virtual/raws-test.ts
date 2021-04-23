import { expect } from "chai";
import { DependencyNodeContent } from "paperclip-utils";
import { createMockEngine } from "../utils";

describe(__filename + "#", () => {
  it("Maintains raws for elements", async () => {
    const graph = {
      "/entry.pc": `\n<div></div>`
    };
    const engine = await createMockEngine(graph);
    await engine.open("/entry.pc");

    const result = (await engine.getLoadedAst("/entry.pc")) as any;

    expect(result.children[0].raws.before).to.eql("\n");
  });

  it("Maintains raws for style rules", async () => {
    const graph = {
      "/entry.pc": `\n<style>\ndiv { color: red; }</style>`
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
        end: 36
      },
      children: [
        {
          kind: "StyleElement",
          attributes: [],
          sheet: {
            raws: {
              before: "\n",
              after: null
            },
            rules: [
              {
                kind: "Style",
                selector: {
                  kind: "Element",
                  tagName: "div",
                  location: {
                    start: 9,
                    end: 12
                  }
                },
                declarations: [
                  {
                    declarationKind: "KeyValue",
                    name: "color",
                    value: "red",
                    location: {
                      start: 15,
                      end: 26
                    },
                    nameLocation: {
                      start: 15,
                      end: 20
                    },
                    valueLocation: {
                      start: 22,
                      end: 25
                    }
                  }
                ],
                children: [],
                location: {
                  start: 9,
                  end: 28
                },
                raws: {
                  before: "",
                  after: null
                }
              }
            ],
            declarations: [],
            location: {
              start: 8,
              end: 28
            }
          },
          location: {
            start: 1,
            end: 36
          }
        }
      ]
    });
  });
});
