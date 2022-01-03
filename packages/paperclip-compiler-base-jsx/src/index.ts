import { CompileOptions } from "paperclip-interim";
import { PaperclipConfig } from "paperclip-utils";
import { codeCompiler, CodeCompilerOptions } from "./code-compiler";
import * as babel from "@babel/core";
import {
  definitionCompiler,
  DefinitionCompilerOptions
} from "./definition-compiler";

export type CompilersOptions = {
  code: CodeCompilerOptions;
  definition: DefinitionCompilerOptions;
  extensionName: string | ((config: PaperclipConfig) => string);
};

export const compilers = ({
  code,
  definition,
  extensionName
}: CompilersOptions) => {
  const compile2Code = codeCompiler(code);
  const compile2Defition = definitionCompiler(definition);

  return ({ module, fileUrl, includes, config }: CompileOptions) => {
    const { code, map } = compile2Code(module, fileUrl, config, includes);

    let outputCode = code;

    if ((config.compilerOptions as any)?.es5) {
      outputCode = babel.transformSync(code, { presets: ["@babel/preset-env"] })
        .code;
    }

    const ext =
      typeof extensionName == "function"
        ? extensionName(config)
        : extensionName;

    return {
      ["." + ext]: outputCode,
      ["." + ext + ".map"]: map.toString(),
      ".d.ts": compile2Defition(module, fileUrl, config)
    };
  };
};
