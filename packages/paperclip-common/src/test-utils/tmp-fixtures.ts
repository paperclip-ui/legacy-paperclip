import * as path from "path";
import * as fsa from "fs-extra";
import { kebabCase } from "lodash";

export const saveTmpFixtureFiles = (
  title: string,
  files: Record<string, string>,
  basedir: string
) => {
  const testDir = path.join(basedir, kebabCase(title));

  const saveFiles = (files: Record<string, string>) => {
    for (const relativePath in files) {
      const filePath = path.join(testDir, relativePath);
      fsa.mkdirpSync(path.dirname(filePath));
      fsa.writeFileSync(filePath, files[relativePath]);
    }
  };

  saveFiles(files);

  return {
    testDir,
    saveFiles,
    dispose: () => {
      fsa.rmSync(testDir, { recursive: true });
    }
  };
};
