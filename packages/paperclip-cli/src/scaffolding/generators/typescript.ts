import * as fsa from "fs-extra";
import * as path from "path";
import { GeneratorKind } from "./base";
import { FILES_DIR } from "./utils";

const TSCONFIG_CONTENT = fsa.readFileSync(
  path.join(FILES_DIR, "tsconfig.json"),
  "utf8"
);

export const typescript = {
  kind: GeneratorKind.TypeScript,
  prepare() {
    return {
      [GeneratorKind.Node]: {
        devDependencies: ["typescript", "ts-loader"]
      },
      [GeneratorKind.Webpack]: {
        rules: `{
          test: /\\.(ts|tsx)?$/,
          loader: "ts-loader",
          include: [path.resolve(__dirname, "src")],
          exclude: [/node_modules/]
        }`
      }
    };
  },
  generate() {
    return {
      "tsconfig.json": TSCONFIG_CONTENT
    };
  }
};
