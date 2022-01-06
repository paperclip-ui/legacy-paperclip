import * as globby from "globby";
import * as URL from "url";
import * as path from "path";
import * as fs from "fs";
import { EventEmitter } from "events";
import * as chokidar from "chokidar";
import { EngineDelegate } from "paperclip";
import { flatten } from "lodash";
import { InterimCompiler, CompileOptions } from "paperclip-interim";
import {
  PaperclipConfig,
  getPaperclipConfigIncludes,
  isPaperclipResourceFile,
  isCSSFile,
  buildCompilerOptions,
  getOutputFile,
  isPaperclipFile,
  getScopedCSSFilePath,
  CompilerOptions
} from "paperclip-utils";
import { TargetNotFoundError } from "./errors";

type BaseOptions = {
  config: PaperclipConfig;
  gitignore?: boolean;
  cwd: string;
};

export type BuildDirectoryOptions = BaseOptions & {
  watch?: boolean;
};

type BuildFileOptions = BaseOptions & {
  targetCompilerOptions: CompilerOptions;
};

class Compiler {
  private _cssContents: Array<[string, string]>;
  private _compiledInitially: boolean;

  /**
   */
  constructor(
    private _em: EventEmitter,
    private _engine: EngineDelegate,
    private _targetOptions: CompilerOptions,
    private _builderOptions: BuildDirectoryOptions
  ) {
    this._cssContents = [];
    assertRequireCompilerTarget(
      this._builderOptions.cwd,
      this._builderOptions.config,
      this._targetOptions
    );
  }
  async buildFile(filePath: string) {
    if (!isPaperclipResourceFile(filePath)) {
      return;
    }
    try {
      const result = await buildFile(filePath, this._engine, {
        ...this._builderOptions,
        targetCompilerOptions: this._targetOptions
      });

      const outFilePath = getOutputFile(
        filePath,
        this._builderOptions.config,
        this._targetOptions,
        this._builderOptions.cwd
      );

      for (const ext in result.translations) {
        const content = result.translations[ext];
        if (content) {
          let newFilePath = outFilePath + ext;
          this._emitFile(newFilePath, content, true);
        }
      }

      if (this._targetOptions?.mainCSSFileName) {
        this._addCSSContent(filePath, result.css);
      } else {
        if (isCSSFile(outFilePath)) {
          this._emitFile(getScopedCSSFilePath(outFilePath), result.css, true);
        } else {
          this._emitFile(outFilePath + ".css", result.css, true);
        }
      }

      for (const asset of result.assets) {
        if (!asset.outputFilePath || asset.outputFilePath === asset.filePath) {
          continue;
        }
        this._emitFile(
          asset.outputFilePath,
          fs.readFileSync(asset.filePath),
          false
        );
      }
    } catch (e) {
      this._em.emit("error", e, filePath);
    }
  }
  async wrap() {
    this._compiledInitially = true;
    this._maybeEmitMainCSSFile();
  }

  private _emitFile(
    filePath: string,
    content: string | Buffer,
    isGeneratedFromPC: boolean
  ) {
    if (this._targetOptions.emit && isGeneratedFromPC) {
      // strip PC extension (looks like file.pc.js) so that we're just left with "js"
      const ext = filePath.replace(/.*?(\.pc)?\./, "");
      if (!this._targetOptions.emit.includes(ext)) {
        return;
      }
    }

    this._em.emit("file", filePath, content);
  }

  private _addCSSContent(modulePath: string, cssContent: string) {
    let found = false;
    for (let i = this._cssContents.length; i--; ) {
      if (this._cssContents[i][0] === modulePath) {
        this._cssContents[i][1] = cssContent;
        found = true;
        break;
      }
    }
    if (!found) {
      this._cssContents.push([modulePath, cssContent]);
    }

    if (!this._compiledInitially) {
      return;
    }

    this._maybeEmitMainCSSFile();
  }

  private _maybeEmitMainCSSFile() {
    if (!this._targetOptions.mainCSSFileName) {
      return;
    }
    const mainContent = this._cssContents.reduce(
      (mainContent, [_filePath, content]) => {
        mainContent.push(content);
        return mainContent;
      },
      []
    );

    this._em.emit(
      "file",
      getMainCSSFilePath(
        this._builderOptions.cwd,
        this._builderOptions.config,
        this._targetOptions
      ),
      mainContent.join("\n")
    );
  }
}

export class DirectoryBuilder {
  private _compilers: Compiler[];
  private _em: EventEmitter;

  constructor(
    readonly engine: EngineDelegate,
    readonly options: BuildDirectoryOptions
  ) {
    this._em = new EventEmitter();
    this._compilers = buildCompilerOptions(options.config).map(
      targetOptions => new Compiler(this._em, engine, targetOptions, options)
    );
  }

  /**
   */

  async start() {
    const sources = getPaperclipConfigIncludes(
      this.options.config,
      this.options.cwd
    );

    const filePaths = flatten(
      await Promise.all(
        sources.map(inc =>
          globby(inc, {
            gitignore: this.options.gitignore !== false ? true : false
          })
        )
      )
    );

    await Promise.all(filePaths.map(this._buildFile));
    if (!this.options.watch) {
      this._em.emit("end");
    }

    await this._wrap();

    if (this.options.watch) {
      sources.forEach(source =>
        watch(this.options.cwd, source, this._buildFile)
      );
    } else {
      this._em.emit("end");
    }
    return this;
  }

  /**
   */
  _buildFile = async (filePath: string) => {
    for (const compiler of this._compilers) {
      await compiler.buildFile(filePath);
    }
  };

  /**
   */

  _wrap = async () => {
    for (const compiler of this._compilers) {
      await compiler.wrap();
    }
  };

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
  compile: (options: CompileOptions) => Record<string, string>;
};

export const buildDirectory = (
  options: BuildDirectoryOptions,
  engine: EngineDelegate
) => {
  return new DirectoryBuilder(engine, options);
};

function watch(cwd, filesGlob, compileFile) {
  const watcher = chokidar.watch(filesGlob, {
    cwd: cwd
  });

  watcher.on("change", file => {
    compileFile(path.join(cwd, file));
  });
}

const getMainCSSFilePath = (
  cwd: string,
  config: PaperclipConfig,
  targetOptions: CompilerOptions
) => {
  return path.join(
    cwd,
    targetOptions.assetOutDir || targetOptions.outDir || config.srcDir,
    targetOptions.mainCSSFileName
  );
};

const assertRequireCompilerTarget = (
  cwd: string,
  config: PaperclipConfig,
  targetOptions: CompilerOptions
) => {
  const targetCompilers = requireTargetCompilers(cwd, config, targetOptions);

  if (!targetCompilers.length) {
    if (targetOptions.target) {
      throw new TargetNotFoundError(
        `Paperclip compiler target "${targetOptions.target}" not found`
      );
    } else {
      throw new TargetNotFoundError(`No Paperclip compilers found`);
    }
  }

  return targetCompilers;
};

/**
 * Builds from Paperclip config.
 */

export const buildFile = async (
  filePath: string,
  engine: EngineDelegate,
  { config, cwd, targetCompilerOptions: targetOptions }: BuildFileOptions
) => {
  const targetCompilers = assertRequireCompilerTarget(
    cwd,
    config,
    targetOptions
  );
  const fileUrl =
    filePath.indexOf("file://") === 0
      ? filePath
      : URL.pathToFileURL(filePath).href;

  const interimCompiler = createInterimCompiler(
    engine,
    { config, cwd },
    targetOptions
  );
  const interimModule = interimCompiler.parseFile(fileUrl);

  let translations: Record<string, string> = {};

  if (isPaperclipFile(filePath)) {
    const includes: string[] = [];

    if (targetOptions?.importAssetsAsModules) {
      if (targetOptions?.mainCSSFileName) {
        includes.push(
          path.resolve(
            path.dirname(filePath),
            getMainCSSFilePath(cwd, config, targetOptions)
          )
        );
      } else {
        includes.push("./" + path.basename(filePath) + ".css");
      }
    }

    translations = targetCompilers.reduce((files, compiler) => {
      return Object.assign(
        files,
        compiler.compile({
          module: interimModule,
          fileUrl,
          includes,
          config,
          targetOptions,
          cwd
        })
      );
    }, {});
  }

  return {
    translations,
    css: interimModule.css.sheetText,
    assets: interimModule.assets
  };
};

const createInterimCompiler = (
  engine: EngineDelegate,
  { config, cwd }: BaseOptions,
  targetOptions: CompilerOptions
) =>
  new InterimCompiler(engine, {
    cwd,
    config,
    targetOptions
  });

const requireTargetCompilers = (
  cwd: string,
  config: PaperclipConfig,
  options: CompilerOptions
): TargetCompiler[] => {
  const localDirs = cwd
    .split("/")
    .map((part, index, parts) =>
      [...parts.slice(0, index + 1), "node_modules"].join("/")
    )
    .filter(dir => dir !== "node_modules");

  const possibleDirs = [...localDirs, "/usr/local/lib/node_modules"];

  const compilers: Record<string, TargetCompiler> = {};

  for (const possibleDir of possibleDirs) {
    if (!fs.existsSync(possibleDir)) {
      continue;
    }

    for (const moduleName of fs.readdirSync(possibleDir)) {
      if (/paperclip-compiler-/.test(moduleName) && !compilers[moduleName]) {
        if (
          !options.target ||
          options.target === moduleName.substring("paperclip-compiler-".length)
        ) {
          compilers[moduleName] = require(path.join(possibleDir, moduleName));
        }
      }
    }
  }

  return Object.values(compilers).filter(compiler => compiler.compile != null);
};
