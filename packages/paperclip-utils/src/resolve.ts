import * as path from "path";
import * as url from "url";
import * as glob from "glob";
import { stripFileProtocol } from "./utils";
import { PC_CONFIG_FILE_NAME } from "./constants";
import { config } from "process";
import { PaperclipConfig } from "./config";

export const resolveImportUri = fs => (fromPath: string, toPath: string) => {
  const filePath = resolveImportFile(fs)(fromPath, toPath);
  return filePath;
};

export const resolveImportFile = fs => (fromPath: string, toPath: string) => {
  try {
    if (/\w+:\/\//.test(toPath)) {
      return toPath;
    }

    if (toPath.charAt(0) !== ".") {
      const uri = resolveModule(fs)(fromPath, toPath);
      if (!uri) {
        throw new Error(`module ${toPath} not found`);
      }
      return uri;
    }

    return url.resolve(fromPath, toPath);
  } catch (e) {
    return null;
  }
};

const resolveModule = fs => (fromPath: string, moduleRelativePath: string) => {
  const configUrl = findPCConfigUrl(fs)(fromPath);
  if (!configUrl) return null;

  const url = new URL(configUrl) as any;

  // need to parse each time in case config changed.
  const config = JSON.parse(fs.readFileSync(url, "utf8"));
  if (!config.moduleDirectories) return null;
  const configPathDir = path.dirname(stripFileProtocol(configUrl));
  for (const moduleDirectory of config.moduleDirectories) {
    fs.realpat;
    const moduleFileUrl =
      "file://" +
      fixPath(
        path.normalize(
          path.join(configPathDir, moduleDirectory, moduleRelativePath)
        )
      );
    if (fs.existsSync(new URL(moduleFileUrl))) {
      // Need to follow symlinks
      return "file://" + fixPath(fs.realpathSync(new URL(moduleFileUrl)));
    }
  }
  return null;
};

export const findPCConfigUrl = fs => (fromPath: string): string | null => {
  let cdir: string = path.dirname(stripFileProtocol(fromPath));

  // can't cache in case PC config was moved.
  do {
    const configPath =
      "file://" + fixPath(path.join(cdir, PC_CONFIG_FILE_NAME));
    const configUrl = new URL(configPath) as any;
    if (fs.existsSync(configUrl)) {
      return configPath;
    }
    cdir = path.dirname(cdir);
  } while (cdir !== "/" && cdir !== ".");
  return null;
};


const fixPath = (path: string) => path.replace(/\\/g, "/");
