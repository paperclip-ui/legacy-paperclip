import * as resolve from "resolve";
import { PaperclipConfig, PaperclipResourceWatcher } from "paperclip-utils";
import EventEmitter from "events";
import { InterimCompiler } from "paperclip-compiler-interim";
import { EngineDelegate } from "paperclip";

export type Options = {
  cwd?: string;
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

/**
 * Builds from Paperclip config.
 */

export const buildFromConfig = (config: PaperclipConfig, options: Options) => {
  const em = new EventEmitter();

  return new BuildProcess(em);
};

/**
 */

export const $$buildFile = (
  filePath: string,
  config: PaperclipConfig,
  options: Options,
  engine: EngineDelegate
) => {
  const compilerModulePath = resolve2(config.compilerOptions.name);

  if (!compilerModulePath) {
    throw new Error(
      `Compiler "${config.compilerOptions.name}" couldn\'t be found', compiler);`
    );
  }
  const compiler = require(compilerModulePath);

  if (!compiler || !compiler.compileFile) {
    throw new Error(
      `Compiler "${config.compilerOptions.name}" does not export compile function`
    );
  }

  const files: Record<string, string> = {};

  const intermCompiler = new InterimCompiler(engine);
  const interm = intermCompiler.parseFile(filePath);

  files[filePath + ".css"] = interm.css.sheetText;

  Object.assign(compiler.compileFile(filePath, interm));

  return files;
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
