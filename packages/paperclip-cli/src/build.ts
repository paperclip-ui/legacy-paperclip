import * as resolve from "resolve";
import { URL } from "url";
import * as chokidar from "chokidar";
import * as path from "path";
import * as fs from "fs";
import {
  PaperclipConfig,
  CompilerOptions,
  Engine,
  paperclipSourceGlobPattern,
  Node,
  getPrettyMessage,
  getAllVirtSheetClassNames,
  stringifyCSSSheet
} from "paperclip";
import * as glob from "glob";

export type BuildOptions = {
  config: string;
  write: boolean;
  definition: boolean;
  watch: boolean;
  dropPcExtension: boolean;
  compilerName: string;
  sourceDirectory: string;
};

type CompileInfo = {
  ast: Node;
  classNames: string[];
};

type CompilerModule = {
  getOutputFilePath(uri: string, options: CompilerOptions): string;
  compile(info: CompileInfo, uri: string, options: any);
};

export const build = async (options: BuildOptions) => {
  let localConfig: PaperclipConfig;

  try {
    localConfig = require(resolve2(
      options.config || path.join(process.cwd(), "/paperclip.config")
    ));
  } catch (e) {}

  const config: PaperclipConfig = {
    ...(localConfig || {}),
    dropPcExtension: options.dropPcExtension || localConfig.dropPcExtension,
    sourceDirectory: options.sourceDirectory || localConfig.sourceDirectory,
    compilerOptions: {
      ...localConfig.compilerOptions,
      definition: options.definition || localConfig.compilerOptions.definition,
      name: options.compilerName || localConfig.compilerOptions.name
    }
  };

  const compiler = config.compilerOptions.name;
  const sourceDirectory = config.sourceDirectory;

  const compilerModulePath = resolve2(compiler);
  if (!compilerModulePath) {
    console.error('Compiler "%s" couldn\'t be found', compiler);
    process.exit();
  }

  const compileModule = require(compilerModulePath);

  if (!compileModule || !compileModule.compile) {
    console.error('Compiler "%s" does not export compile function', compiler);
    process.exit();
  }

  initBuild(process.cwd(), sourceDirectory, compileModule, options, config);
};

function initBuild(
  cwd,
  sourceDirectory: string,
  { compile, getOutputFilePath }: CompilerModule,
  options: BuildOptions,
  config: PaperclipConfig
) {
  const pcEngine = new Engine();

  function handleError(error, filePath) {
    console.error(
      getPrettyMessage(
        error,
        fs.readFileSync(filePath.replace("file://", ""), "utf8"),
        filePath
      )
    );
  }

  async function compileFile(relativePath) {
    let fullPath = `file://${path
      .resolve(process.cwd(), relativePath)
      .replace(/\\/g, "/")
      .replace(":", "%3A")}`;
    const compilerOptions = config.compilerOptions;
    try {
      const ast = pcEngine.parseFile(fullPath);
      if (ast.error) {
        return handleError(ast.error, fullPath);
      }
      const sheet = pcEngine.evaluateFileStyles(fullPath);

      if (sheet.error) {
        return handleError(sheet.error, fullPath);
      }

      const styleMap = {
        [fullPath]: sheet
      };
      const result = compile(
        { ast, classNames: getAllVirtSheetClassNames(styleMap) },
        fullPath,
        compilerOptions
      );

      if (options.write) {
        let outputFilePath = getOutputFilePath(fullPath, compilerOptions);
        if (config.dropPcExtension) {
          outputFilePath = outputFilePath.replace(".pc", "");
        }
        const url = new URL(outputFilePath);
        console.log("Writing %s", path.relative(process.cwd(), url.pathname));
        fs.writeFileSync(url, result);

        if (!compilerOptions.definition) {
          const cssFilePath = outputFilePath.replace(/\.\w+$/, ".css");
          console.log("Writing %s", cssFilePath);
          fs.writeFileSync(
            new URL(cssFilePath),
            stringifyCSSSheet(sheet, "file://")
          );
        }
      } else {
        console.log("Compiling %s", relativePath);

        // Keep me for stdout
        console.log(result);
      }
    } catch (e) {
      console.log("Err %s", relativePath);
      console.error(e);
    }
  }

  console.log(paperclipSourceGlobPattern(sourceDirectory), cwd);

  glob(
    paperclipSourceGlobPattern(sourceDirectory),
    {
      cwd: cwd
    },
    async function(err, filePaths) {
      filePaths.map(compileFile);
    }
  );

  if (options.watch) {
    watch(cwd, paperclipSourceGlobPattern(sourceDirectory), compileFile);
  }
}

function watch(cwd, filesGlob, compileFile) {
  const watcher = chokidar.watch(filesGlob, {
    cwd: cwd
  });

  watcher.on("change", compileFile);
}

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
