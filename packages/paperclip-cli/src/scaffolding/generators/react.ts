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
  getParams({ cwd }) {
    return [{ cwd }, []];
  },
  prepare({ cwd }, allInfo) {
    const devDependencies = ["@paperclipui/compiler-react"];

    if (allInfo[GeneratorKind.Node].useTypescript) {
      devDependencies.push("@types/react", "@types/react-dom");
    }

    return {
      [GeneratorKind.React]: {
        cwd
      },
      [GeneratorKind.Node]: {
        dependencies: ["react", "react-dom"],
        devDependencies
      },
      [GeneratorKind.Webpack]: {
        entry: this.getEntry(allInfo)
      },
      [GeneratorKind.Root]: {
        compilerName: "@paperclipui/compiler-react"
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
  generate({ cwd }, allInfo) {
    if (fsa.existsSync(path.join(cwd, "package.json"))) {
      return {};
    }

    return {
      [this.getEntry(allInfo)]: ENTRY_TSX_CONTENT.replace(
        "{{PROJECT_NAME}}",
        allInfo[GeneratorKind.Node].name
      )
    };
  }
};
