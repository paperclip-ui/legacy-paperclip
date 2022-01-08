import * as url from "url";
import * as fs from "fs";
import * as babel from "@babel/core";
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

    engine.open(fileUri);
    const { js } = buildFile(fileUri, engine, { config }).translations[".js"];
    return babel.transformSync(js, {
      presets: ["@babel/env"],
      configFile: false
    }).code;
  }
};
