import * as resolve from "resolve";
import { buildDirectory } from "paperclip-builder";
import * as path from "path";
import * as URL from "url";
import * as fs from "fs";
import { getPrettyMessage } from "paperclip-cli-utils";
import {
  isPaperclipFile,
  PaperclipConfig,
  stripFileProtocol
} from "paperclip-utils";
import { createEngineDelegate } from "paperclip";
import { mkdirpSync } from "fs-extra";

export type BuildOptions = {
  cwd: string;
  config?: string;
  print: boolean;
  output?: string;
  only?: string[];
  watch: boolean;
  compilerName?: string;
  sourceDirectory?: string;
  outputDirectory?: string;
  verbose: boolean;
};

export const build = async (options: BuildOptions) => {
  const config = loadConfig(options);
  const engine = createEngineDelegate({});
  const builder = buildDirectory(
    {
      watch: options.watch,
      cwd: options.cwd,
      config
    },
    engine
  );

  builder
    .onFile((outFilePath: string, content: string) => {
      const ext = outFilePath.replace(/.*?(\.pc)?\./, "");

      if (options.only && !options.only.includes(ext)) {
        return;
      }

      if (options.verbose) {
        console.log("Write %s", path.relative(options.cwd, outFilePath));
      }
      if (options.print && isPaperclipFile(outFilePath)) {
        console.log(content);
      } else {
        writeFileSync(outFilePath, content, options);
      }
    })
    .onError((error, filePath) => {
      const info = error.info || error;
      if (info?.range) {
        console.error(
          getPrettyMessage(
            info,
            fs.readFileSync(stripFileProtocol(filePath), "utf8"),
            URL.pathToFileURL(filePath),
            options.cwd
          )
        );
      } else {
        console.error(error);
      }
    })
    .start();
};

const writeFileSync = (
  filePath: string,
  content: string,
  options: BuildOptions
) => {
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

  const srcDir = options.outputDirectory || localConfig.srcDir;
  const outDir =
    options.output || localConfig.compilerOptions?.outDir || srcDir;

  return {
    ...localConfig,
    compilerOptions: {
      ...(localConfig.compilerOptions || {}),
      outDir
    },
    srcDir
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
