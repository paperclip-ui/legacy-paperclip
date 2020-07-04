import { extensionFactory } from "zeplin-extension-style-kit/factory";

import Generator from "./generator";

export default extensionFactory({
  language: "paperclip",
  Generator,
  exportTextStylesOptions: {},
  exportColorsOptions: {},
  exportSpacingOptions: {}
});
