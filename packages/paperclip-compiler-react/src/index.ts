import { compilers } from "@paperclipui/compiler-base-jsx";
import { TargetCompiler } from "@paperclipui/interim";

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
