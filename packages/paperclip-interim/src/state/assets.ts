export type InterimAsset = {
  relativePath: string;

  // absolute file path to the asset
  filePath: string;

  outputFilePath: string;

  // file content if embedded
  moduleContent?: string;
};
