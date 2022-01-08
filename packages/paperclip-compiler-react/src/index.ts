import { compilers } from "@paperclip-ui/compiler-base-jsx";
import { TargetCompiler } from "@paperclip-ui/interim";

export const compile: TargetCompiler = compilers({
  code: {
    preflight: "",
    imports: `import React from "react";\n`,
    vendorName: "React"
  },
  definition: {
    imports: `import {ReactElement} from "react";\n`,
    elementType: "ReactElement"
  },
  extensionName: "js"
});
