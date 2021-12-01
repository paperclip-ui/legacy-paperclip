export type CompilerOptions = {
  outDir: string;
  importAssetsAsModules?: boolean;
  embedAssetMaxSize?: number;
  assetOutDir?: string;
  assetPrefix?: string;
};

type LintConfig = {
  noUnusedStyles?: boolean;
  enforceVars?: string[];
  enforcePreviews?: boolean;
};

export type PaperclipConfig = {

  srcDir: string;

  compilerOptions?: CompilerOptions;

  moduleDirectories?: string[];

  lint?: LintConfig;
};
