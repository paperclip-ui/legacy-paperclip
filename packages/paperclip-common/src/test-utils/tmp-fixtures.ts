import * as path from "path";
import * as URL from "url";
import * as fsa from "fs-extra";
import { kebabCase } from "lodash";

export const saveTmpFixtureFiles = (
  title: string,
  files: Record<string, string>,
  basedir: string
) => {
  const testDir = path.join(basedir, kebabCase(title));
  const fixtureUris: Record<string, string> = {};

  const saveFiles = (files: Record<string, string>) => {
    for (const relativePath in files) {
      const filePath = path.join(testDir, relativePath);
      fixtureUris[relativePath] = URL.pathToFileURL(filePath).href;
      fsa.mkdirpSync(path.dirname(filePath));
      fsa.writeFileSync(filePath, files[relativePath]);
    }
  };

  saveFiles(files);

  return {
    testDir,
    fixtureUris,
    saveFiles,
    dispose: () => {
      fsa.rmSync(testDir, { recursive: true });
    },
  };
};
