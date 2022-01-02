import { glob } from "glob";
import * as URL from "url";
import * as path from "path";
import * as fs from "fs";
import { EventEmitter } from "events";
import * as chokidar from "chokidar";
import { EngineDelegate } from "paperclip";
import { flatten } from "lodash";
import {
  InterimCompiler,
  InterimModule,
  CompileOptions
} from "paperclip-interim";
import {
  PaperclipConfig,
  getPaperclipConfigIncludes,
  isPaperclipResourceFile,
  isCSSFile,
  getOutputFile,
  isPaperclipFile,
  getScopedCSSFilePath
} from "paperclip-utils";

type BaseOptions = {
  config: PaperclipConfig;
  cwd: string;
};

export type BuildDirectoryOptions = BaseOptions & {
  watch?: boolean;
};

class DirectoryBuilder {
  private _em: EventEmitter;
  private _compiledInitially: boolean;
  private _cssContents: Array<[string, string]>;

  constructor(
    readonly engine: EngineDelegate,
    readonly options: BuildDirectoryOptions
  ) {
    this._cssContents = [];
    this._em = new EventEmitter();
  }
  async start() {
    const sources = getPaperclipConfigIncludes(
      this.options.config,
      this.options.cwd
    );

    const filePaths = flatten(sources.map(inc => glob.sync(inc)));

    await Promise.all(filePaths.map(this._buildFile));
    if (!this.options.watch) {
      this._em.emit("end");
    }
    this._compiledInitially = true;
    this._maybeEmitMainCSSFile();

    if (this.options.watch) {
      sources.forEach(source =>
        watch(this.options.cwd, source, this._buildFile)
      );
    } else {
      this._em.emit("end");
    }
    return this;
  }
  _buildFile = async (filePath: string) => {
    if (!isPaperclipResourceFile(filePath)) {
      return;
    }
    try {
      const result = await buildFile(filePath, this.engine, this.options);

      const outFilePath = getOutputFile(
        filePath,
        this.options.config,
        this.options.cwd
      );

      for (const ext in result.translations) {
        const content = result.translations[ext];
        if (content) {
          let newFilePath = outFilePath + ext;
          this._em.emit("file", newFilePath, content);
        }
      }

      if (this.options.config.compilerOptions?.mainCSSFileName) {
        this._addCSSContent(filePath, result.css);
      } else {
        if (isCSSFile(outFilePath)) {
          this._em.emit("file", getScopedCSSFilePath(outFilePath), result.css);
        } else {
          this._em.emit("file", outFilePath + ".css", result.css);
        }
      }

      for (const asset of result.assets) {
        if (!asset.outputFilePath) {
          continue;
        }
        this._em.emit(
          "file",
          asset.outputFilePath,
          fs.readFileSync(asset.filePath)
        );
      }
    } catch (e) {
      this._em.emit("error", e, filePath);
    }
  };
  private _maybeEmitMainCSSFile() {
    if (!this.options.config.compilerOptions?.mainCSSFileName) {
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
      getMainCSSFilePath(this.options.cwd, this.options.config),
      mainContent.join("\n")
    );
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

  watcher.on("change", compileFile);
}

const getMainCSSFilePath = (cwd: string, config: PaperclipConfig) => {
  return path.join(
    cwd,
    config.compilerOptions.assetOutDir ||
      config.compilerOptions.outDir ||
      config.srcDir,
    config.compilerOptions.mainCSSFileName
  );
};

/**
 * Builds from Paperclip config.
 */

export const buildFile = async (
  filePath: string,
  engine: EngineDelegate,
  options: BaseOptions
) => {
  const fileUrl =
    filePath.indexOf("file://") === 0
      ? filePath
      : URL.pathToFileURL(filePath).href;

  const interimCompiler = createInterimCompiler(engine, options);
  const interimModule = interimCompiler.parseFile(fileUrl);
  const targetCompilers = requireTargetCompilers(options.cwd, options.config);

  let translations: Record<string, string> = {};

  if (isPaperclipFile(filePath)) {
    const includes: string[] = [];

    if (options.config.compilerOptions.importAssetsAsModules) {
      if (options.config.compilerOptions.mainCSSFileName) {
        includes.push(
          path.resolve(
            path.dirname(filePath),
            getMainCSSFilePath(options.cwd, options.config)
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
          config: options.config,
          cwd: options.cwd
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
  { config, cwd }: BaseOptions
) =>
  new InterimCompiler(engine, {
    cwd,
    config
  });

const requireTargetCompilers = (
  cwd: string,
  config: PaperclipConfig
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
        compilers[moduleName] = require(path.join(possibleDir, moduleName));
      }
    }
  }

  return Object.values(compilers).filter(compiler => compiler.compile != null);
};
