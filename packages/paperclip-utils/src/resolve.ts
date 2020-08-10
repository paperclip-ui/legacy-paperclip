import * as path from "path";
import * as url from "url";
import { stripFileProtocol } from "./utils";
import { PC_CONFIG_FILE_NAME } from "./constants";
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

const readJSONSync = fs => (uri: string) =>
  JSON.parse(fs.readFileSync(uri, "utf8"));

const resolveModule = fs => (fromPath: string, moduleRelativePath: string) => {
  const configUrl = findPCConfigUrl(fs)(fromPath);
  if (!configUrl) return null;

  const uri = new URL(configUrl) as any;

  // need to parse each time in case config changed.
  const config: PaperclipConfig = readJSONSync(fs)(uri);
  const configPathDir = path.dirname(stripFileProtocol(configUrl));

  const moduleFileUrl = url.pathToFileURL(
    path.normalize(
      path.join(configPathDir, config.sourceDirectory, moduleRelativePath)
    )
  );

  // FIRST look for modules in the sourceDirectory
  if (fs.existsSync(moduleFileUrl)) {
    // Need to follow symlinks
    return url.pathToFileURL(fs.realpathSync(moduleFileUrl)).href;
  }

  // No bueno? Move onto the module directories then

  if (config.moduleDirectories) {
    const firstSlashIndex = moduleRelativePath.indexOf("/");
    const moduleName = moduleRelativePath.substr(0, firstSlashIndex);
    const srcPath = moduleRelativePath.substr(firstSlashIndex);
    for (let i = 0, { length } = config.moduleDirectories; i < length; i++) {
      const moduleDir = config.moduleDirectories[i];
      const moduleDirectory = path.join(configPathDir, moduleDir, moduleName);
      // const modulePath = resolveModule(fs)(moduleDirectory, srcPath);
      // const modulePCFilePath = path.join(moduleDirectory, PC_CONFIG_FILE_NAME);

      // if (!fs.existsSync(modulePCFilePath)) {
      //   continue;
      // }

      // const moduleConfig: PaperclipConfig = readJSONSync(modulePCFilePath);

      const modulePath = path.join(moduleDirectory, srcPath);

      if (fs.existsSync(modulePath)) {
        return url.pathToFileURL(modulePath).href;
      }

      // const moduleConfig: PaperclipConfig = readJSONSync(fs)(modulePCFilePath);
      // console.log(moduleConfig);
    }
  }

  return null;
};

export const findPCConfigUrl = fs => (fromUri: string): string | null => {
  let cdir: string = stripFileProtocol(fromUri);

  // can't cache in case PC config was moved.
  do {
    const configUrl = url.pathToFileURL(path.join(cdir, PC_CONFIG_FILE_NAME));
    if (fs.existsSync(configUrl)) {
      return configUrl.href;
    }
    cdir = path.dirname(cdir);
  } while (cdir !== "/" && cdir !== "." && !/^\w+:\\$/.test(cdir));
  return null;
};
