import * as fsa from "fs-extra";
import * as path from "path";
import { GeneratorKind } from "./base";
import { FILES_DIR } from "./utils";

const ENTRY_TSX_CONTENT = fsa.readFileSync(
  path.join(FILES_DIR, "entry-tsx"),
  "utf8"
);

export const react = {
  kind: GeneratorKind.React,
  prepare(_info, allInfo) {
    const devDependencies = ["paperclip-compiler-react"];

    if (allInfo[GeneratorKind.Node].useTypescript) {
      devDependencies.push("@types/react", "@types/react-dom");
    }

    return {
      [GeneratorKind.Node]: {
        dependencies: ["react", "react-dom"],
        devDependencies
      },
      [GeneratorKind.Webpack]: {
        entry: this.getEntry(allInfo)
      },
      [GeneratorKind.Root]: {
        compilerName: "paperclip-compiler-react"
      }
    };
  },
  getEntry(allInfo) {
    return (
      allInfo[GeneratorKind.Root].sourceDirectory +
      "/entry." +
      (allInfo[GeneratorKind.Node].useTypescript ? "tsx" : "jsx")
    );
  },
  generate(info, allInfo) {
    return {
      [this.getEntry(allInfo)]: ENTRY_TSX_CONTENT.replace(
        "{{PROJECT_NAME}}",
        allInfo[GeneratorKind.Node].name
      )
    };
  }
};
