import * as url from "url";
import * as fs from "fs";
import * as babel from "@babel/core";
import * as path from "path";
import { buildCompilerOptions } from "@paperclip-ui/utils";
import {
  createEngineDelegate,
  PC_CONFIG_FILE_NAME,
  findPCConfigUrl,
  PaperclipConfig
} from "@paperclip-ui/core";
import { buildFile } from "@paperclip-ui/builder";

const engine = createEngineDelegate();

module.exports = {
  process(_content, fullPath) {
    const fileUri = url.pathToFileURL(fullPath).href;
    const pcUrl = findPCConfigUrl(fs)(fullPath);
    if (!pcUrl) {
      throw new Error(`Unable to config ${PC_CONFIG_FILE_NAME}`);
    }
    const config: PaperclipConfig = JSON.parse(
      fs.readFileSync(url.fileURLToPath(pcUrl), "utf8")
    );

    let code;

    // somewhat of a dumb approach to figuring out what emits. JS will want to be more specific about this at
    // some point. Maybe pulling in env var as a good stop gap?
    for (const targetCompilerOptions of buildCompilerOptions(config)) {
      if (
        targetCompilerOptions.emit &&
        !targetCompilerOptions.emit.includes("js")
      ) {
        continue;
      }
      code = buildFile(fileUri, engine, {
        cwd: path.dirname(fullPath),
        config,
        targetCompilerOptions
      }).translations[".js"];

      if (code) {
        break;
      }
    }

    engine.open(fileUri);
    return babel.transformSync(code, {
      presets: ["@babel/env"],
      configFile: false
    }).code;
  }
};
