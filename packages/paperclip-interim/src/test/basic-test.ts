import { expect } from "chai";
import { createMockEngine } from "@paperclip-ui/core/lib/test/utils";
import { InterimCompiler } from "..";
import { stringifyInterimModule } from "./utils";

describe(__filename + "#", () => {
  [
    [
      `can convert a simple AST to a module`,
      {
        "/src/entry.pc": `<div export component as="Test">
        </div>`,
      },
      {},
      { html: "<style></style> <div></div>" },
    ],
    [
      `Can embed assets`,
      {
        "/src/entry.pc": `
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
        "/e.svg": "embed2",
      },
      {
        embedAssetMaxSize: "embedded-svg".length,
        useAssetHashNames: false,
      },
      {
        html: `<style>@font-face { src:url('data:image/svg+xml;base64,ZW1iZWRkZWQ='); } [class]._a61d499e_a { background-image:url('data:image/svg+xml;base64,ZW1iZWQ='); } [class]._a61d499e_b { background-image:url('/b.svg'); }</style> <img src=data:image/svg+xml;base64,ZW1iZWRkZWQtc3Zn></img> <img src=/b.svg></img> <div><img src=data:image/svg+xml;base64,ZW1iZWQy></img></div>`,
      },
    ],
    [
      `Renames assets to assetOutDir`,
      {
        "/src/entry.pc": `
          <style>
            @font-face {
              src: url(./c.svg);
            }
            .a {
              background-image: url(./d.svg);
            }
            .b {
              background-image: url(./b.svg);
            }
          </style>
          <img export component as="Test" src="/src/a.svg" />
          <img export component as="Test2" src="/src/b.svg" />
          <div export component as="A">
            {<img src="/src/e.svg" />}
          </div>
        `,
        "/src/a.svg": "embedded-svg",
        "/src/b.svg": "not-embedded-svg",
        "/src/c.svg": "embedded",
        "/src/d.svg": "embed",
        "/src/e.svg": "embed2",
      },
      {
        assetOutDir: "./lib",
        srcDir: "/src",
        useAssetHashNames: false,
      },
      {
        html: `<style>@font-face { src:url('../lib/c.svg'); } [class]._a61d499e_a { background-image:url('../lib/d.svg'); } [class]._a61d499e_b { background-image:url('../lib/b.svg'); }</style> <img src=../lib/a.svg></img> <img src=../lib/b.svg></img> <div><img src=../lib/e.svg></img></div>`,
      },
    ],
    [
      `Can embed assets and emit files that exceed max size`,
      {
        "/src/entry.pc": `
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
        "/e.svg": "embed2",
      },
      {
        embedAssetMaxSize: "embedded-svg".length,
        assetOutDir: "./lib",
        srcDir: "/src",
        outDir: "/lib",
      },
      {
        html: `<style>@font-face { src:url('data:image/svg+xml;base64,ZW1iZWRkZWQ='); } [class]._a61d499e_a { background-image:url('data:image/svg+xml;base64,ZW1iZWQ='); } [class]._a61d499e_b { background-image:url('./86098dd56eddbba6fbc9cd7f03ccd8c1.svg'); }</style> <img src=data:image/svg+xml;base64,ZW1iZWRkZWQtc3Zn></img> <img src=./86098dd56eddbba6fbc9cd7f03ccd8c1.svg></img> <div><img src=data:image/svg+xml;base64,ZW1iZWQy></img></div>`,
      },
    ],
    [
      `Can define an asset prefix`,
      {
        "/src/entry.pc": `
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
        "/e.svg": "embed2",
      },
      {
        embedAssetMaxSize: "embedded-svg".length,
        assetOutDir: "./lib",
        srcDir: "/src",
        outDir: "/lib",
        assetPrefix: "http://localhost:3000/",
      },
      {
        html: `<style>@font-face { src:url('data:image/svg+xml;base64,ZW1iZWRkZWQ='); } [class]._a61d499e_a { background-image:url('data:image/svg+xml;base64,ZW1iZWQ='); } [class]._a61d499e_b { background-image:url('http://localhost:3000/lib/86098dd56eddbba6fbc9cd7f03ccd8c1.svg'); }</style> <img src=data:image/svg+xml;base64,ZW1iZWRkZWQtc3Zn></img> <img src=http://localhost:3000/lib/86098dd56eddbba6fbc9cd7f03ccd8c1.svg></img> <div><img src=data:image/svg+xml;base64,ZW1iZWQy></img></div>`,
      },
    ],
    [
      `Includes PC imports`,
      {
        "/src/entry.pc": `
          <import src="/a.pc" as="test" />
        `,
        "/a.pc": "<div></div>",
      },
      {
        embedAssetMaxSize: "embedded-svg".length,
        assetOutDir: "./lib",
        srcDir: "/src",
        outDir: "/lib",
        assetPrefix: "http://localhost:3000/",
      },
      {
        html: `<import src=/a.pc as=test  /><style></style>`,
      },
    ],
    [
      `Omits css imports`,
      {
        "/src/entry.pc": `
          <import src="/a.pc" as="test" />
          <import src="/a.css" inject-styles />
        `,
        "/a.pc": "<div></div>",
        "/a.css": ".a { }",
      },
      {
        embedAssetMaxSize: "embedded-svg".length,
        assetOutDir: "./lib",
        srcDir: "/src",
        outDir: "/lib",
        assetPrefix: "http://localhost:3000/",
      },
      {
        html: `<import src=/a.pc as=test  /><style></style>`,
      },
    ],
    [
      `Includes CSS imports if importAssetsAsModules is true`,
      {
        "/src/entry.pc": `
          <import src="/a.pc" as="test" />
          <import src="/a.css" inject-styles />
        `,
        "/a.pc": "<div></div>",
        "/a.css": ".a { }",
      },
      {
        importAssetsAsModules: true,
      },
      {
        html: `<import src=/a.pc as=test  /><import src=/a.scoped.css as=undefined  /><style></style>`,
      },
    ],
    [
      `Namespaces can be injected`,
      {
        "/src/entry.pc": `
          <import src="/a.css" as="test" />
          <div export component as="A" class="$test a"></div>
        `,
        "/a.css": ".a { }",
      },
      {
        importAssetsAsModules: true,
      },
      {
        html: `<import src=/a.scoped.css as=test  /><style></style> <div class=_a61d499e_test _pub-a61d499e_test test+ _pub-b29b268d_a _a61d499e_a _pub-a61d499e_a a></div>`,
      },
    ],
  ].forEach(
    ([
      title,
      graph,
      {
        embedAssetMaxSize,
        assetOutDir,
        srcDir,
        outDir,
        assetPrefix,
        useAssetHashNames,
        importAssetsAsModules,
      },
      expectedOutput,
    ]: any) => {
      it(title, () => {
        const engine = createMockEngine(graph);
        const interim = new InterimCompiler(engine, {
          cwd: "/",
          config: {
            srcDir,
          },
          targetOptions: {
            outDir,
            importAssetsAsModules,
            assetPrefix,
            embedAssetMaxSize,
            assetOutDir,
            useAssetHashNames,
          },
          io: {
            readFile(filePath) {
              return Buffer.from(graph[filePath]);
            },
            getFileSize(filePath: string) {
              return graph[filePath].length;
            },
          },
        });
        const module = interim.parseFile("/src/entry.pc");
        expect(stringifyInterimModule(module)).to.eql(expectedOutput.html);
      });
    }
  );
});
