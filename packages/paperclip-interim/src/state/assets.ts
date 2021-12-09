export type InterimAsset = {
  relativePath: string;

  // absolute file path to the asset
  filePath: string;

  // file content if embedded
  content?: string;
};
