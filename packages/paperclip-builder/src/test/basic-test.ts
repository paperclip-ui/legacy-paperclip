import { PaperclipConfig, resolvePCConfig } from "paperclip-utils";
import * as path from "path";
import { expect } from "chai";
import * as fsa from "fs-extra";
import { buildDirectory } from "../index";
import { kebabCase } from "lodash";
import { createEngineDelegate } from "paperclip";
import * as globby from "globby";

const TMP_FIXTURE_DIR = path.join(
  __dirname,
  kebabCase(path.basename(__filename)) + "-tmp-fixtures"
);

describe((__filename = "#"), () => {
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
            emit: ["d.ts", ""]
          }
        })
      },
      [
        "src/entry.pc.css",
        "src/entry.pc.d.ts",
        "src/entry.pc.js",
        "src/entry.pc.js.map"
      ]
    ]
  ].forEach(([title, files, expectedFilePaths]: [any, any, any]) => {
    const testDir = path.join(TMP_FIXTURE_DIR, kebabCase(title));

    before(() => {
      for (const relativePath in files) {
        const filePath = path.join(testDir, relativePath);
        fsa.mkdirpSync(path.dirname(filePath));
        fsa.writeFileSync(filePath, files[relativePath]);
      }
    });

    after(() => {
      fsa.rmSync(testDir, { recursive: true });
    });

    it(title, async () => {
      const engine = createEngineDelegate();
      const [config] = resolvePCConfig(fsa)(testDir);
      const builder = buildDirectory(
        { cwd: testDir, config, gitignore: false },
        engine
      );
      const ended = new Promise(resolve => builder.onEnd(() => resolve(null)));
      const emittedFiles: Record<string, string> = {};
      builder.onFile((filePath, content) => {
        emittedFiles[path.relative(testDir, filePath)] = content;
      });
      await builder.start();
      await ended;
      expect(Object.keys(emittedFiles).sort()).to.eql(expectedFilePaths);
    });
  });
});
