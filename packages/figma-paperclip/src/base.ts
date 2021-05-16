export type Config = {
  // project urls
  sources: string[];

  // pc files to include
  includes?: string[];

  outputDir: string;
};

// export enum ResourceType {
//   FILE = "FILE",
//   FONT = "FONT",
//   MEDIA = "MEDIA",
// }

// export type BaseResource<TType extends ResourceType> = {
//   localPath: string;
//   type: TType
// };

// export type FileResource = {
//   content: string;
// } & BaseResource<ResourceType.FILE>;

// export type FontResource = {

// } & BaseResource<ResourceType.FILE>;

// export type Resource = FileResource;

export type OutputFile = {
  path: string;
  content: string;
};
