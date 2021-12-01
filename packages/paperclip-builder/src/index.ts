
import { glob } from "glob";
import * as URL from "url";
import * as path from "path";
import * as fs from "fs";
import {EventEmitter} from "events";
import * as resolve from "resolve";
import * as chokidar from "chokidar";
import { EngineDelegate } from "paperclip";
import { InterimCompiler, InterimModule } from "paperclip-interim";
import { PaperclipConfig, paperclipSourceGlobPattern } from "paperclip-utils";

type BaseOptions = {
  resourceProtocol?: string;
  config: PaperclipConfig;
  cwd: string;
  filesPattern?: string;
};

export type BuildDirectoryOptions = BaseOptions & {
  watch?: boolean;
};

class DirectoryBuilder {
  private _em: EventEmitter;
  constructor(readonly engine: EngineDelegate, readonly options: BuildDirectoryOptions) {
    this._em = new EventEmitter();
  }
  start() {
    glob(
      paperclipSourceGlobPattern(this.options.config.sourceDirectory),
      {
        cwd: this.options.cwd,
        absolute: true
      },
      async (err, filePaths) => {
        filePaths.map(this._buildFile);
        if (this.options.watch) {
          this._em.emit("end");
        }
      }
    );
  
    if (this.options.watch) {
      watch(this.options.cwd, paperclipSourceGlobPattern(this.options.config.sourceDirectory), this._buildFile);
    }
    return this;
  }
  _buildFile = async (filePath: string) => {
    try {
      const files = await buildFile(filePath, this.engine, this.options);
      for (const ext in files) {
        const content = files[ext];
        if (content) {
          this._em.emit("file", filePath + "." + ext, content);
        }
      }
    } catch(e) {
      this._em.emit("error", e, filePath);
    }
  }
  onFile(cb: (file: string, content: string) => void) {
    this._em.on("file", cb);
    return this;
  }
  onError(cb: (error: Error, file: string) => void) {
    this._em.on("error", cb);
    return this;
  }
  onEnd(cb: () => void) {
    this._em.on("end", cb);
    return this;
  }
}

type TargetCompiler = {
  compile: (module: InterimModule, filePath: string, options: any) => Record<string, string>;
}


export const buildDirectory = (options: BuildDirectoryOptions, engine: EngineDelegate) => {
  return new DirectoryBuilder(engine, options);
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

 export const buildFile = async (filePath: string, engine: EngineDelegate, options: BaseOptions) => {
  const fileUrl = URL.pathToFileURL(filePath).href;
  const interimCompiler = createInterimCompiler(engine, options);
  const interimModule = interimCompiler.parseFile(fileUrl);
  const targetCompilers = requireTargetCompilers(options.cwd, options.config);
  return targetCompilers.reduce((files, compiler) => {
    return Object.assign(files, compiler.compile(interimModule, fileUrl, options.config.compilerOptions))
  }, {});
};


const createInterimCompiler = (engine: EngineDelegate, {resourceProtocol}: BaseOptions) => new InterimCompiler(engine, {
  css: resourceUrl => ({
    uri: resourceUrl,
    resolveUrl: resourceProtocol && (url => url.replace("file:", resourceProtocol))
  })
});

const requireTargetCompilers = (cwd: string, config: PaperclipConfig): TargetCompiler[] => {

  const possibleDirs = cwd.split("/").map((part, index, parts) => [...parts.slice(0, index), "node_modules"].join("/"));

  const compilers: Record<string, TargetCompiler> = {};

  for (const possibleDir of possibleDirs) {
    if (!fs.existsSync(possibleDir)) {
      continue;
    }

    for (const moduleName of fs.readdirSync(possibleDir)) {
      if (/paperclip-compiler-/.test(moduleName) && !compilers[moduleName]) {
        compilers[moduleName] = require(path.join(possibleDir, moduleName));
      }
    }
  }

  return Object.values(compilers);
}

