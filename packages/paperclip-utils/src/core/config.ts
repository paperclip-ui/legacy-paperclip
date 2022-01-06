import * as path from "path";
import { paperclipSourceGlobPattern } from "./utils";
const omit = require("lodash/omit");

export type CompilerOptions = {
  // give room for custom props
  [identifier: string]: any;

  target?: string;

  // [d.ts, js, ]
  generate?: string[];

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

export type CompilerOptionsTemplate = {
  // base?: boolean;
} & CompilerOptions;

/*

[
  [
    { base: true, target: ["react"] },
    { outDir: "src" }
  ],
  [
    { base: true, target: ["html"] }
  ]
]

*/

// export type CompilerOptionTemplates = CompilerOptionsTemplate | CompilerOptionsTemplate[] | CompilerOptionTemplates[];
export type CompilerOptionTemplates =
  | CompilerOptionsTemplate
  | CompilerOptionsTemplate[];

/**
 */

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
  compilerOptions?: CompilerOptionTemplates;

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

/**
 */

export const buildCompilerOptions = (
  config: PaperclipConfig
): CompilerOptions => {
  return buildCompilerOptionsFromTemplates(config.compilerOptions);
};

/**
 */

const buildCompilerOptionsFromTemplates = (
  templates?: CompilerOptionTemplates,
  parentBase?: CompilerOptionsTemplate
): CompilerOptions[] => {
  if (!templates) {
    return [];
  }

  if (!Array.isArray(templates)) {
    templates = Array.isArray(templates) ? templates : [templates];
  }

  // const base = templates.find(template => !Array.isArray(template) && template.base) as CompilerOptionsTemplate;

  return templates.reduce((configs, template) => {
    let config = template;

    // if (base) {
    //   config = extendBaseCompilerOptions(template, base);
    // }

    configs.push(config);

    return configs;
  }, []);
};

/**
 */

export const getOutputFile = (
  filePath: string,
  config: PaperclipConfig,
  compilerOptions: CompilerOptions | null,
  cwd: string
) => {
  return compilerOptions?.outDir
    ? filePath.replace(
        path.join(cwd, config.srcDir),
        path.join(cwd, compilerOptions.outDir)
      )
    : filePath;
};
