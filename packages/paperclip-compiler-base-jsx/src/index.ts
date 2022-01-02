import { CompileOptions } from "paperclip-interim";
import { codeCompiler, CodeCompilerOptions } from "./code-compiler";
import {
  definitionCompiler,
  DefinitionCompilerOptions
} from "./definition-compiler";

export type CompilersOptions = {
  code: CodeCompilerOptions;
  definition: DefinitionCompilerOptions;
  extensionName: string;
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

    return {
      ["." + extensionName]: code,
      ["." + extensionName + ".map"]: map.toString(),
      ".d.ts": compile2Defition(module, fileUrl, config)
    };
  };
};
