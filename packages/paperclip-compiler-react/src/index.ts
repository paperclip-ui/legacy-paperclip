import { compilers } from "paperclip-compiler-base-jsx";

export const compile = compilers({
  code: {
    imports: `import React from "react";\n`,
    vendorName: "React"
  },
  definition: {
    imports: `import {ReactElement} from "react";\n`,
    elementType: "ReactElement"
  },
  extensionName: "js"
});
