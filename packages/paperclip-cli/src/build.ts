import * as resolve from "resolve";
import * as chokidar from "chokidar";
import * as path from "path";
import * as url from "url";
import * as fs from "fs";
import {
  PaperclipConfig,
  CompilerOptions,
  createEngine,
  paperclipSourceGlobPattern,
  Node,
  getPrettyMessage,
  stringifyCSSSheet
} from "paperclip";
import { glob } from "glob";
import { ClassNameExport, stripFileProtocol } from "paperclip";

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
  classNames: Record<string, ClassNameExport>;
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

    // eslint-disable-next-line
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

  await initBuild(
    process.cwd(),
    sourceDirectory,
    compileModule,
    options,
    config
  );
};

async function initBuild(
  cwd,
  sourceDirectory: string,
  { compile, getOutputFilePath }: CompilerModule,
  options: BuildOptions,
  config: PaperclipConfig
) {
  const pcEngine = await createEngine();

  function handleError(error, filePath) {
    console.error(
      getPrettyMessage(
        error,
        fs.readFileSync(stripFileProtocol(filePath), "utf8"),
        filePath
      )
    );
  }

  async function compileFile(relativePath) {
    const fullPath = url.pathToFileURL(
      path.resolve(process.cwd(), relativePath)
    ).href;

    const compilerOptions = config.compilerOptions;
    try {
      const ast = pcEngine.parseFile(fullPath);
      if (ast.error) {
        return handleError(ast.error, fullPath);
      }
      const { sheet, exports } = await pcEngine.run(fullPath);

      if (sheet.error) {
        return handleError(sheet.error, fullPath);
      }

      const result = compile(
        { ast, classNames: exports.style.classNames },
        fullPath,
        compilerOptions
      );

      if (options.write) {
        let outputFilePath = getOutputFilePath(fullPath, compilerOptions);
        if (config.dropPcExtension) {
          outputFilePath = outputFilePath.replace(".pc", "");
        }
        const uri = new url.URL(outputFilePath);
        console.log(
          "Writing %s",
          path.relative(process.cwd(), url.fileURLToPath(uri))
        );
        fs.writeFileSync(uri, result);

        if (!compilerOptions.definition) {
          const cssFilePath = outputFilePath.replace(/\.\w+$/, ".css");
          console.log("Writing %s", cssFilePath);
          fs.writeFileSync(
            new url.URL(cssFilePath),
            stringifyCSSSheet(sheet, { protocol: "file://" })
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
