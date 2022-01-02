import { compiler } from "paperclip-compiler-base-jsx";

export const compile = compiler({
  imports: `import React from "react";\n`,
  vendorName: "React"
});
