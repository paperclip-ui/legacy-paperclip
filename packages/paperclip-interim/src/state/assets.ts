export type InterimAsset = {
  originalPath: string;

  // absolute file path to the asset
  filePath: string;

  outputFilePath: string;

  // file content if embedded
  moduleContent?: string;
};
