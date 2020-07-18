import * as path from "path";
import * as url from "url";
import { stripFileProtocol } from "./utils";
import { PC_CONFIG_FILE_NAME } from "./constants";
import { config } from "process";

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

  const uri = new URL(configUrl) as any;

  // need to parse each time in case config changed.
  const config = JSON.parse(fs.readFileSync(uri, "utf8"));
  const configPathDir = path.dirname(stripFileProtocol(configUrl));

  const moduleFileUrl = url.pathToFileURL(
    path.normalize(
      path.join(configPathDir, config.sourceDirectory, moduleRelativePath)
    )
  );

  if (fs.existsSync(moduleFileUrl)) {
    // Need to follow symlinks
    return url.pathToFileURL(fs.realpathSync(moduleFileUrl)).href;
  }
  return null;
};

export const findPCConfigUrl = fs => (fromPath: string): string | null => {
  let cdir: string = stripFileProtocol(fromPath);

  // can't cache in case PC config was moved.
  do {
    const configUrl = url.pathToFileURL(path.join(cdir, PC_CONFIG_FILE_NAME));

    if (fs.existsSync(configUrl)) {
      return configUrl.href;
    }
    cdir = path.dirname(cdir);
  } while (cdir !== "/" && cdir !== ".");
  return null;
};
