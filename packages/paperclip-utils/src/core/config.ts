import * as path from "path";
import { paperclipSourceGlobPattern } from "./utils";

export type CompilerOptions = {
  // give room for custom props
  [identifier: string]: any;

  target?: string[];

  // where PC files should be compiled to. If undefined, then
  // srcDir is used
  outDir?: string;

  // treat assets as modules
  importAssetsAsModules?: boolean;

  // main CSS file name
  mainCSSFileName?: string;

  // embed assets until this size
  embedAssetMaxSize?: number;

  // output directory for non-PC files. If not specified, then srcDir
  // will be used
  assetOutDir?: string;

  // prefix for assets,
  assetPrefix?: string;

  useAssetHashNames?: boolean;
};

type LintOptions = {
  // flag CSS code that is not currently used
  noUnusedStyles?: boolean;

  // enforce CSS vars for these properties
  enforceVars?: string[];
};

export type PaperclipConfig = {
  // source directory where *.pc files live
  srcDir: string;

  // directories where modules are stored
  moduleDirs?: string[];

  // options for the output settings
  compilerOptions?: CompilerOptions | CompilerOptions[];

  lintOptions?: LintOptions;

  // include?: string[];
};

export const getPaperclipConfigIncludes = (
  config: PaperclipConfig,
  cwd: string
) => {
  if (config.srcDir) {
    return [paperclipSourceGlobPattern(path.join(cwd, config.srcDir))];
  }

  // if (config.include) {
  //   return config.include.map(inc => path.join(cwd, inc));
  // }

  return [path.join(paperclipSourceGlobPattern(cwd))];
};

export const getCompilerOptions = (config: PaperclipConfig) =>
  config.compilerOptions
    ? Array.isArray(config.compilerOptions)
      ? config.compilerOptions
      : [config.compilerOptions]
    : [];

export const getOutputFile = (
  filePath: string,
  config: PaperclipConfig,
  cwd: string
) => {
  return getCompilerOptions(config).map(options => {
    return options.outDir
      ? filePath.replace(
          path.join(cwd, config.srcDir),
          path.join(cwd, options.outDir)
        )
      : filePath;
  });
};
