import { CompileOptions } from "paperclip-interim";
import { CompilerOptions } from "paperclip-utils";
import { codeCompiler, CodeCompilerOptions } from "./code-compiler";
import * as babel from "@babel/core";
import {
  definitionCompiler,
  DefinitionCompilerOptions
} from "./definition-compiler";

export type CompilersOptions = {
  code: CodeCompilerOptions;
  definition: DefinitionCompilerOptions;
  extensionName: string | ((config: CompilerOptions) => string);
};

export const compilers = ({
  code,
  definition,
  extensionName
}: CompilersOptions) => {
  const compile2Code = codeCompiler(code);
  const compile2Defition = definitionCompiler(definition);

  return ({
    module,
    fileUrl,
    includes,
    config,
    targetOptions
  }: CompileOptions) => {
    const { code, map } = compile2Code(
      module,
      fileUrl,
      config,
      targetOptions,
      includes
    );

    let outputCode = code;

    if (targetOptions.es5) {
      outputCode = babel.transformSync(code, { presets: ["@babel/preset-env"] })
        .code;
    }

    const ext =
      typeof extensionName == "function"
        ? extensionName(targetOptions)
        : extensionName;

    return {
      ["." + ext]: outputCode,
      ["." + ext + ".map"]: map.toString(),
      ".d.ts": compile2Defition(module, fileUrl, config, targetOptions)
    };
  };
};
