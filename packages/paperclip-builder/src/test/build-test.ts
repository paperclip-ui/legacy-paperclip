import * as path from "path";
import { expect } from "chai";
import * as fsa from "fs-extra";
import { kebabCase } from "lodash";
import { saveTmpFixtureFiles } from "./utils";

const TMP_FIXTURE_DIR = path.join(
  __dirname,
  kebabCase(path.basename(__filename)) + "-tmp-fixtures"
);

describe(__filename + "#", () => {
  before(() => {
    try {
      fsa.rmdirSync(TMP_FIXTURE_DIR);

      // eslint-disable-next-line
    } catch (e) {}
    fsa.mkdirpSync(TMP_FIXTURE_DIR);
  });

  [
    [
      `It can build a simple file`,
      {
        "src/entry.pc": `<div>
          Hello world
        </div>`,
        "paperclip.config.json": JSON.stringify({
          srcDir: "src",
          compilerOptions: {
            target: "react"
          }
        })
      },
      [
        "src/entry.pc.css",
        "src/entry.pc.d.ts",
        "src/entry.pc.js",
        "src/entry.pc.js.map"
      ]
    ],
    [
      `Can specify what files to emit`,
      {
        "src/entry.pc": `<div>
          Hello world
        </div>`,
        "paperclip.config.json": JSON.stringify({
          srcDir: "src",
          compilerOptions: {
            target: "react",
            emit: ["d.ts", "js", "css"]
          }
        })
      },
      ["src/entry.pc.css", "src/entry.pc.d.ts", "src/entry.pc.js"]
    ],
    [
      `assets are included outside of generate field`,
      {
        "src/entry.pc": `<div>
          <img src="./test.png" />
        </div>`,
        "src/test.png": "hello",
        "paperclip.config.json": JSON.stringify({
          srcDir: "src",
          compilerOptions: {
            target: "react",
            emit: ["js"],
            assetOutDir: "lib"
          }
        })
      },
      ["lib/5d41402abc4b2a76b9719d911017c592.png", "src/entry.pc.js"]
    ],
    [
      `Does not emit assets if outDir is srcDir`,
      {
        "src/entry.pc": `<div>
          <img src="./test.png" />
        </div>`,
        "src/test.png": "hello",
        "paperclip.config.json": JSON.stringify({
          srcDir: "src",
          compilerOptions: {
            target: "react",
            emit: ["js"]
          }
        })
      },
      ["src/entry.pc.js"]
    ],
    [
      `Emits assets to outDir if specified`,
      {
        "src/entry.pc": `<div>
          <img src="./test.png" />
        </div>`,
        "src/test.png": "hello",
        "paperclip.config.json": JSON.stringify({
          srcDir: "src",
          compilerOptions: {
            target: "react",
            emit: ["js"],
            outDir: "lib"
          }
        })
      },
      ["lib/entry.pc.js"]
    ],
    [
      `Emits assets even if target is not provided`,
      {
        "src/entry.pc": `<div>
          <img src="./test.png" />
        </div>`,
        "src/test.png": "hello",
        "paperclip.config.json": JSON.stringify({
          srcDir: "src",
          compilerOptions: {
            emit: ["js"],
            outDir: "lib"
          }
        })
      },
      ["lib/entry.pc.js"]
    ]
  ].forEach(([title, files, expectedFilePaths]: [any, any, any]) => {
    let tmp;

    before(() => {
      tmp = saveTmpFixtureFiles(title, files);
    });

    after(() => {
      tmp.dispose();
    });

    it(title, async () => {
      const emittedFiles = await tmp.buildFiles();
      expect(Object.keys(emittedFiles).sort()).to.eql(expectedFilePaths);
    });
  });
});
