import * as resolve from "resolve";
import { buildDirectory } from "paperclip-builder";
import * as path from "path";
import * as url from "url";
import * as fs from "fs";
import { getPrettyMessage } from "paperclip-cli-utils";
import { PaperclipConfig, stripFileProtocol } from "paperclip-utils";
import { createEngineDelegate } from "paperclip";
import { mkdirpSync } from "fs-extra";


export type BuildOptions = {
  cwd: string;
  config?: string;
  write: boolean;
  targets?: string[];
  watch: boolean;
  compilerName?: string;
  sourceDirectory?: string;
  outputDirectory?: string;
  verbose: boolean;
};


export const build = async (options: BuildOptions) => {

  const config = loadConfig(options);
  const engine = createEngineDelegate({})
  const builder = buildDirectory({
    watch: options.watch,
    cwd: options.cwd,
    config,
  }, engine);

  const srcDir = path.join(
    options.cwd,
    config.sourceDirectory
  );

  const outDir = path.join(
    options.cwd,
    config.outputDirectory
  );

  builder.onFile((filePath: string, content: string) => {

    const ext = filePath.replace(/.*?\.pc\./, "");

    if (options.targets && !options.targets.includes(ext)) {
      return;
    }

    const outFilePath = filePath.replace(srcDir, outDir);

    if (options.verbose) {
      console.log("Compiled %s", path.relative(options.cwd, outFilePath));
    }
    if (options.write) {
      writeFileSync(outFilePath, content, options);
    } else {
      console.log(content);
    }
  }).onError((error, filePath) => {
    if (error.range) {
      console.error(
        getPrettyMessage(
          error,
          fs.readFileSync(stripFileProtocol(filePath), "utf8"),
          filePath,
          options.cwd
        )
      );
    } else {
      console.error(error);
    }
  }).start();
};


const writeFileSync = (filePath: string, content: string, options: BuildOptions) => {
  mkdirpSync(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
};

const loadConfig = (options: BuildOptions): PaperclipConfig => {
  let localConfig: Partial<PaperclipConfig> = {};

  try {
    localConfig = require(resolve2(
      options.config || path.join(options.cwd, "/paperclip.config")
    ));

    // eslint-disable-next-line
  } catch (e) {}

  const sourceDirectory = options.outputDirectory || localConfig.sourceDirectory;
  const outputDirectory = options.outputDirectory || localConfig.outputDirectory || sourceDirectory;

  return {
    ...localConfig,
    compilerOptions: {
      ...localConfig.compilerOptions,
      name: options.compilerName || localConfig.compilerOptions.name,
    },
    sourceDirectory,
    outputDirectory,
  };
};



const resolve2 = module => {
  try {
    return resolve.sync(module, { basedir: process.cwd() });
  } catch (e) {
    try {
      return require.resolve(module);
    } catch (e) {
      return null;
    }
  }
};
