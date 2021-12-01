import { InterimAsset } from "./assets";
import { InterimCSS } from "./css";
import { InterimComponent } from "./html";

export type InterimImport = {
  namespace?: string;
  publicScopeId: string;
  filePath: string;
  relativePath: string;
  usedTagNames: string[];
  injectedStyles: boolean;
};

export type InterimModule = {
  imports: InterimImport[];

  // exported components
  components: InterimComponent[];

  // compiled CSS in this doc -- dev just needs to include generated text
  // wherever and load in the module
  css: InterimCSS;

  // assets (svg, jpg, etc) embedded in this doc.
  assets: InterimAsset[];
};
