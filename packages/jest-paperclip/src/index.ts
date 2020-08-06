import * as url from "url";
import * as fs from "fs";
import * as resolve from "resolve";
import * as path from "path";
import * as babel from "@babel/core";
import {
  createEngineSync,
  PC_CONFIG_FILE_NAME,
  findPCConfigUrl,
  PaperclipConfig
} from "paperclip";

const engine = createEngineSync();

module.exports = {
  process(content, fullPath) {
    const fileUri = url.pathToFileURL(fullPath).href;
    const pcUrl = findPCConfigUrl(fs)(fullPath);
    if (!pcUrl) {
      throw new Error(`Unable to config ${PC_CONFIG_FILE_NAME}`);
    }
    const {
      compilerOptions: { name: compilerName }
    }: PaperclipConfig = JSON.parse(
      fs.readFileSync(url.fileURLToPath(pcUrl), "utf8")
    );

    if (!compilerName) {
      throw new Error(`compiler.name is not defined in ${PC_CONFIG_FILE_NAME}`);
    }

    const {
      exports: {
        style: { classNames }
      }
    } = engine.run(fileUri);

    const { compile } = require(resolve.sync(compilerName, {
      basedir: path.dirname(fullPath)
    }));

    const ast = engine.parseContent(content);

    const es6 = compile({ ast, classNames }, fileUri, {});

    return babel.transformSync(es6, {
      presets: ["@babel/env"]
    }).code;
  }
};
