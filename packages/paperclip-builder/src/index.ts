import * as resolve from "resolve";
import * as fs from "fs";
import * as path from "path";
import * as URL from "url";
import * as chokidar from "chokidar";
import { PaperclipConfig, PaperclipResourceWatcher, paperclipSourceGlobPattern, resolvePCConfig } from "paperclip-utils";
import EventEmitter from "events";
import { InterimCompiler, InterimModule } from "paperclip-compiler-interim";
import { createEngineDelegate, EngineDelegate } from "paperclip";
import { glob } from "glob";

type BaseOptions = {
  resourceProtocol?: string;
};

export type BuildDirectoryOptions = BaseOptions & {
  watch?: boolean;
};

class BuildProcess {
  constructor(private _em: EventEmitter) {}
  onFile(cb: (file: string) => void) {
    this._em.on("file", cb);
  }
  onError(cb: (error: Error, file: string) => void) {
    this._em.on("error", cb);
  }
  onEnd(cb: (file: string) => void) {
    this._em.on("end", cb);
  }
}

type TargetCompiler = {
  compile: (module: InterimModule, filePath: string, options: any) => Record<string, string>;
}


export const buildDirectory = async (directory: string, engine: EngineDelegate, options: BuildDirectoryOptions = {}) => {
  const [config] = resolvePCConfig(fs)(directory);

  const buildFile2 = buildFile(engine, options);

  glob(
    paperclipSourceGlobPattern(config.sourceDirectory),
    {
      cwd: directory
    },
    async function(err, filePaths) {
      filePaths.map(buildFile2);
    }
  );

  if (options.watch) {
    watch(directory, paperclipSourceGlobPattern(config.sourceDirectory), buildFile2);
  }
};


function watch(cwd, filesGlob, compileFile) {
  const watcher = chokidar.watch(filesGlob, {
    cwd: cwd
  });

  watcher.on("change", compileFile);
}

/**
 * Builds from Paperclip config.
 */

 export const buildFile = (engine: EngineDelegate, options: BaseOptions = {}) => async (filePath: string) => {
  const interimCompiler = createInterimCompiler(engine, options);
  const interimModule = interimCompiler.parseFile(filePath);

  const [config, configUrl] = resolvePCConfig(fs)(filePath);
  const configPath = URL.fileURLToPath(configUrl);
  const targetCompiler = requireTargetCompiler(path.dirname(configPath), config);

  targetCompiler.compile(interimModule, filePath, config.compilerOptions);
};


const createInterimCompiler = (engine: EngineDelegate, {resourceProtocol}: BaseOptions) => new InterimCompiler(engine, {
  css: resourceUrl => ({
    uri: resourceUrl,
    resolveUrl: resourceProtocol && (url => url.replace("file:", resourceProtocol))
  })
});

const requireTargetCompiler = (cwd: string, config: PaperclipConfig): TargetCompiler => require(resolve.sync(config.compilerOptions.name, {
  basedir: cwd
}));

