import * as resolve from "resolve";
import {
  buildDirectory,
  TargetNotFoundError,
  DirectoryBuilder
} from "@paperclipui/builder";
import * as path from "path";
import * as URL from "url";
import * as fs from "fs";
import { getPrettyMessage } from "@paperclipui/cli-utils";
import {
  isPaperclipFile,
  PaperclipConfig,
  stripFileProtocol
} from "@paperclipui/utils";
import { createEngineDelegate } from "paperclip";
import { mkdirpSync } from "fs-extra";

export type BuildOptions = {
  cwd: string;
  config?: string;
  print: boolean;
  watch: boolean;
  compilerName?: string;
  sourceDirectory?: string;
  verbose: boolean;
};

export const build = async (options: BuildOptions) => {
  const config = loadConfig(options);
  const engine = createEngineDelegate({});

  let builder: DirectoryBuilder;

  try {
    builder = buildDirectory(
      {
        watch: options.watch,
        cwd: options.cwd,
        config
      },
      engine
    );
  } catch (error) {
    if (error instanceof TargetNotFoundError) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    return;
  }

  builder
    .onFile((outFilePath: string, content: string) => {
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
  try {
    return require(resolve2(
      options.config || path.join(options.cwd, "/paperclip.config")
    ));

    // eslint-disable-next-line
  } catch (e) {
    return {};
  }
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
