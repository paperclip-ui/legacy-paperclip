import { LoadedData, SourceLocation } from "paperclip-utils";

type Color = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

type ColorInfo = {
  value: Color;
  location: SourceLocation;
};

type ASTInfo = {
  colors: ColorInfo[];
};

export const collectASTInfo = (
  uri: string,
  evaluatedData: Record<string, LoadedData>
) => {
  const info: ASTInfo = {
    colors: []
  };

  return info;
};
