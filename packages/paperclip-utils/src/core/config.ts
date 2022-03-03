import * as path from "path";
import { paperclipSourceGlobPattern } from "./utils";

// TODO - ability to include vendor in extension
export type CompilerOptions = {
  // give room for custom props
  [identifier: string]: any;

  target?: string;

  // [d.ts, js, ]
  emit?: string[];

  // where PC files should be compiled to. If undefined, then
  // srcDir is used
  outDir: string;

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

export type CompilerOptionsTemplate = Omit<CompilerOptions, "outDir"> & {
  outDir?: string;
  // base?: boolean;
};

/*

[
  [
    { base: true, target: "target" },
    { outDir: "src" }
  ],
  [
    { base: true, target: "html" }
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
  srcDir?: string;

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
    // This should actually be **RESOURCE** global pattern including CSS files. However,
    // we can't do that now since there may be CSS files that clobber the PC engine. What we
    // need to do is load CSS resources based on what each PC file loads
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
): CompilerOptions[] => {
  return buildCompilerOptionsFromTemplates(config, config.compilerOptions);
};

/**
 */

const buildCompilerOptionsFromTemplates = (
  config: PaperclipConfig,
  templates?: CompilerOptionTemplates
): CompilerOptions[] => {
  if (!templates) {
    return [{ outDir: config.srcDir }];
  }

  if (!Array.isArray(templates)) {
    templates = Array.isArray(templates) ? templates : [templates];
  }

  // const base = templates.find(template => !Array.isArray(template) && template.base) as CompilerOptionsTemplate;

  return templates.reduce((allCompilerOptions, template) => {
    const compilerOptions = template;

    allCompilerOptions.push({
      outDir: config.srcDir,
      ...compilerOptions,
    });

    return allCompilerOptions;
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
