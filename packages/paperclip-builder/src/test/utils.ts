import { resolvePCConfig } from "@paperclip-ui/utils";
import * as path from "path";
import * as fsa from "fs-extra";
import { buildDirectory } from "../index";
import { createEngineDelegate } from "@paperclip-ui/core";
import { DirectoryBuilder } from "../build";
import { saveTmpFixtureFiles as saveTmpFixtureFiles2 } from "@paperclip-ui/common/lib/test-utils";
import { kebabCase } from "lodash";

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
  const fixtures = saveTmpFixtureFiles2(title, files, TMP_FIXTURE_DIR);
  const testDir = fixtures.testDir;

  let builder: DirectoryBuilder;
  const emittedFiles: Record<string, string> = {};

  return {
    ...fixtures,
    emittedFiles,
    async buildFiles() {
      const engine = createEngineDelegate();
      const [config] = resolvePCConfig(fsa)(testDir);
      builder = buildDirectory(
        { cwd: testDir, config, gitignore: false, watch: options.watch },
        engine
      );
      const ended = new Promise((resolve) =>
        builder.onEnd(() => resolve(null))
      );
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
      fixtures.dispose();
    },
  };
};
