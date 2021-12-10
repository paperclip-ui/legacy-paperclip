import { expect } from "chai";
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
        "/entry.pc": `
          <style>
            @font-face {
              src: url(/c.svg);
            }
            .a {
              background-image: url(/d.svg);
            }
            .b {
              background-image: url(/b.svg);
            }
          </style>
          <img export component as="Test" src="/a.svg" />
          <img export component as="Test2" src="/b.svg" />
          <div export component as="A">
            {<img src="/e.svg" />}
          </div>
        `,
        "/a.svg": "embedded-svg",
        "/b.svg": "not-embedded-svg",
        "/c.svg": "embedded",
        "/d.svg": "embed",
        "/e.svg": "embed2"
      },
      {
        embedFileSizeLimit: "embedded-svg".length
      },
      {
        html: `<style>@font-face { src:url(data:image/svg+xml;base64,ZW1iZWRkZWQ=); } [class]._80f4925f_a { background-image:url(data:image/svg+xml;base64,ZW1iZWQ=); } [class]._80f4925f_b { background-image:url(/b.svg); }</style> <img src=data:image/svg+xml;base64,ZW1iZWRkZWQtc3Zn></img> <img src=/b.svg></img> <div><img src=data:image/svg+xml;base64,ZW1iZWQy></img></div>`
      }
    ]
  ].forEach(([title, graph, { embedFileSizeLimit }, expectedOutput]: any) => {
    it(title, () => {
      const engine = createMockEngine(graph);
      const interim = new InterimCompiler(engine, {
        cwd: "/",
        config: {
          srcDir: "/",
          compilerOptions: {
            embedFileSizeLimit
          }
        },
        io: {
          readFile(filePath) {
            return Buffer.from(graph[filePath]);
          },
          getFileSize(filePath: string) {
            return graph[filePath].length;
          }
        }
      });
      const module = interim.parseFile("/entry.pc");
      expect(stringifyInterimModule(module)).to.eql(expectedOutput.html);
    });
  });
});
