import * as fsa from "fs-extra";
import * as path from "path";
import { GeneratorKind } from "./base";
import { FILES_DIR } from "./utils";

const BABELRC_CONTENT = fsa.readFileSync(
  path.join(FILES_DIR, ".babelrc"),
  "utf8"
);

export const javascript = {
  kind: GeneratorKind.JavaScript,
  prepare() {
    return {
      [GeneratorKind.Node]: {
        devDependencies: [
          "babel-loader",
          "@babel/core",
          "@babel/preset-react",
          "@babel/preset-env"
        ]
      },
      [GeneratorKind.Webpack]: {
        rules: `{
          test: /\\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        }`
      }
    };
  },
  generate() {
    return {
      ".babelrc": BABELRC_CONTENT
    };
  }
};
