import { CSSExports } from "../css/exports";

export type PCExports = {
  components: Record<string, ComponentExport>;
  style: CSSExports;
};

export type ComponentProperty = {
  name: string;
  optional: boolean;
};

export type ComponentExport = {
  name: string;
  properties: Record<string, ComponentProperty>;
  public: boolean;
};
