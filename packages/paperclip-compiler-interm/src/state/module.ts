import { IntermAsset } from "./assets";
import { IntermCSS } from "./css";
import { IntermComponent } from "./html";

export type IntermImport = {
  namespace?: string;
  publicScopeId: string;
  filePath: string;
  usedTagNames: string[];
  injectedStyles: boolean;
};

export type IntermediatModule = {
  imports: IntermImport[];

  // exported components
  components: IntermComponent[];

  // compiled CSS in this doc -- dev just needs to include generated text
  // wherever and load in the module
  css: IntermCSS;

  // assets (svg, jpg, etc) embedded in this doc.
  assets: IntermAsset[];
};
