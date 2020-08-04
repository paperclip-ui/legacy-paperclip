import * as path from "path";
import * as fsa from "fs-extra";
import { root } from "./generators";
import { mergeWith } from "lodash";

export type GenerateProjectFileOptions = {
  isNewDirectory: boolean;
  cwd: string;
};

export const generateProjectFiles = async (
  options: GenerateProjectFileOptions
) => {
  const current: any = [root];
  const allParams = {};
  const usedGenerators = {};

  // get params
  while (current.length) {
    const generator = current.shift();
    usedGenerators[generator.kind] = generator;
    if (generator.getParams) {
      const [params, generators] = await generator.getParams(options);
      allParams[generator.kind] = params;
      current.push(...generators);
    }
  }

  const prepInfo = await run(usedGenerators, "prepare", allParams);
  const files = await run(usedGenerators, "generate", prepInfo);

  // WRITE
  for (const relativePath in files) {
    const content = files[relativePath];
    if (!content) {
      continue;
    }
    const absPath = path.join(options.cwd, relativePath);

    // Normalize relative dirs
    console.info(`✍️  Writing ${path.relative(options.cwd, absPath)}`);
    fsa.mkdirpSync(path.dirname(absPath));
    fsa.writeFileSync(absPath, content);
  }

  await run(usedGenerators, "install", prepInfo);
  const postInstallInfo = await run(usedGenerators, "postinstall", prepInfo);
  await run(usedGenerators, "fin", postInstallInfo);
};

const run = async (usedGenerators, script, prepInfo) => {
  let allResults = {};
  for (const kind in usedGenerators) {
    const gen = usedGenerators[kind];
    if (gen[script]) {
      const result =
        (await usedGenerators[kind][script](prepInfo[kind], prepInfo)) || {};
      allResults = mergeWith(allResults, result, (objValue, srcValue) => {
        if (Array.isArray(objValue)) {
          return objValue.concat(srcValue);
        }
      });
    }
  }
  return allResults;
};
