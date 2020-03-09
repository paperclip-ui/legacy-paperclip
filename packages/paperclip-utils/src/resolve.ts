import * as path from "path";
import * as url from "url";
import { stripFileProtocol } from "./utils";
import { PC_CONFIG_FILE_NAME } from "./constants";

export const resolveImportUri = fs => (fromPath: string, toPath: string) => {
  const filePath = resolveImportFile(fs)(fromPath, toPath);
  console.log("RESOLVE", filePath);
  return filePath;
};

export const resolveImportFile = fs => (fromPath: string, toPath: string) => {
  if (/\w+:\/\//.test(toPath)) {
    return toPath;
  }

  if (toPath.charAt(0) !== ".") {
    return resolveModule(fs)(fromPath, toPath) || toPath;
  }

  return url.resolve(fromPath, toPath);
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
    const moduleFileUrl =
      "file://" +
      fixPath(
        path.normalize(
          path.join(configPathDir, moduleDirectory, moduleRelativePath)
        )
      );
    if (fs.existsSync(new URL(moduleFileUrl))) {
      return moduleFileUrl;
    }
  }
  return null;
};

const findPCConfigUrl = fs => (fromPath: string): string | null => {
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
