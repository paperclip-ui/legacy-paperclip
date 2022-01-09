import { resolvePCConfig } from "@paperclip-ui/utils";
import * as path from "path";
import * as fsa from "fs-extra";
import { buildDirectory } from "../index";
import { kebabCase } from "lodash";
import { createEngineDelegate } from "@paperclip-ui/core";
import { DirectoryBuilder } from "../build";

const TMP_FIXTURE_DIR = path.join(
  __dirname,
  kebabCase(path.basename(__filename)) + "-tmp-fixtures"
);

export type Options = {
  watch?: boolean;
};

export const saveTmpFixtureFiles = (
  title: string,
  files: Record<string, string>,
  options: Options = {}
) => {
  const testDir = path.join(TMP_FIXTURE_DIR, kebabCase(title));

  const saveFiles = (files: Record<string, string>) => {
    for (const relativePath in files) {
      const filePath = path.join(testDir, relativePath);
      fsa.mkdirpSync(path.dirname(filePath));
      fsa.writeFileSync(filePath, files[relativePath]);
    }
  };

  saveFiles(files);

  let builder: DirectoryBuilder;
  const emittedFiles: Record<string, string> = {};

  return {
    testDir,
    saveFiles,
    emittedFiles,
    async buildFiles() {
      const engine = createEngineDelegate();
      const [config] = resolvePCConfig(fsa)(testDir);
      builder = buildDirectory(
        { cwd: testDir, config, gitignore: false, watch: options.watch },
        engine
      );
      const ended = new Promise(resolve => builder.onEnd(() => resolve(null)));
      builder.onFile((filePath, content) => {
        emittedFiles[path.relative(testDir, filePath)] = content;
      });
      await builder.start();
      await ended;
      return emittedFiles;
    },
    dispose: () => {
      if (builder) {
        builder.stop();
      }
      fsa.rmSync(testDir, { recursive: true });
    }
  };
};
