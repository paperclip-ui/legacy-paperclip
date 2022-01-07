import { resolvePCConfig } from "@paperclipui/utils";
import * as path from "path";
import * as fsa from "fs-extra";
import { buildDirectory } from "../index";
import { kebabCase } from "lodash";
import { createEngineDelegate } from "@paperclipui/core";

const TMP_FIXTURE_DIR = path.join(
  __dirname,
  kebabCase(path.basename(__filename)) + "-tmp-fixtures"
);

export const saveTmpFixtureFiles = (
  title: string,
  files: Record<string, string>
) => {
  const testDir = path.join(TMP_FIXTURE_DIR, kebabCase(title));

  for (const relativePath in files) {
    const filePath = path.join(testDir, relativePath);
    fsa.mkdirpSync(path.dirname(filePath));
    fsa.writeFileSync(filePath, files[relativePath]);
  }

  return {
    testDir,
    async buildFiles() {
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
      return emittedFiles;
    },
    dispose: () => {
      fsa.rmSync(testDir, { recursive: true });
    }
  };
};
