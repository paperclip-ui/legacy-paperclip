import * as path from "path";
import * as url from "url";
import { stripFileProtocol } from "./utils";
import { PC_CONFIG_FILE_NAME } from "./constants";
import { PaperclipConfig } from "./config";

export const resolveImportUri = (fs) => (fromPath: string, toPath: string) => {
  const filePath = resolveImportFile(fs)(fromPath, toPath);
  return filePath;
};

export const resolveImportFile = (fs) => (fromPath: string, toPath: string) => {
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

    const uri = url.resolve(fromPath, toPath);

    // always want realpath here since file name is used as ID for PC files - need
    // to make sure that we're not doubling up on the same files.
    try {
      return url.pathToFileURL(fs.realpathSync(url.fileURLToPath(uri))).href;
    } catch (e) {
      return uri;
    }
  } catch (e) {
    return null;
  }
};

const readJSONSync = (fs) => (uri: string) =>
  JSON.parse(fs.readFileSync(uri, "utf8"));

export const resolvePCConfig =
  (fs) =>
  (fromPath: string): [PaperclipConfig, string] | null => {
    const configUrl = findPCConfigUrl(fs)(fromPath);
    if (!configUrl) return null;
    const uri = new URL(configUrl) as any;

    // need to parse each time in case config changed.
    return [readJSONSync(fs)(uri), configUrl];
  };

const resolveModule =
  (fs) => (fromPath: string, moduleRelativePath: string) => {
    // need to parse each time in case config changed.
    const [config, configUrl] = resolvePCConfig(fs)(fromPath) || [];

    if (!config) {
      return null;
    }

    const configPathDir = path.dirname(stripFileProtocol(configUrl));

    const moduleFileUrl = url.pathToFileURL(
      path.normalize(
        path.join(configPathDir, config.srcDir, moduleRelativePath)
      )
    );

    // FIRST look for modules in the sourceDirectory
    if (fs.existsSync(moduleFileUrl)) {
      // Need to follow symlinks
      return url.pathToFileURL(fs.realpathSync(moduleFileUrl)).href;
    }

    // No bueno? Move onto the module directories then
    if (config.moduleDirs) {
      const firstSlashIndex = moduleRelativePath.indexOf("/");
      const moduleName =
        firstSlashIndex !== -1
          ? moduleRelativePath.substring(0, firstSlashIndex)
          : moduleRelativePath;
      const srcPath =
        firstSlashIndex !== -1
          ? moduleRelativePath.substring(firstSlashIndex)
          : "";

      for (let i = 0, { length } = config.moduleDirs; i < length; i++) {
        const moduleDir = config.moduleDirs[i];
        const moduleDirectory = path.join(
          resolveModuleDirectory(fs)(configPathDir, moduleDir),
          moduleName
        );
        const modulePath = path.join(moduleDirectory, srcPath);

        if (fs.existsSync(modulePath)) {
          const actualPath = fs.realpathSync(modulePath);

          return url.pathToFileURL(actualPath).href;
        }
      }
    }

    return null;
  };

const resolveModuleDirectory = (fs) => (cwd: string, moduleDir: string) => {
  const c0 = moduleDir.charAt(0);
  if (c0 === "/" || c0 === ".") {
    return path.join(cwd, moduleDir);
  }
  let cdir = cwd;

  while (1) {
    const maybeDir = path.join(cdir, moduleDir);
    if (fs.existsSync(maybeDir)) {
      return maybeDir;
    }
    if (cdir === "/") {
      break;
    }
    cdir = path.dirname(cdir);
  }
};

export const findPCConfigUrl =
  (fs) =>
  (fromUri: string): string | null => {
    let cdir: string = stripFileProtocol(fromUri);

    // can't cache in case PC config was moved.
    while (1) {
      const configUrl = url.pathToFileURL(path.join(cdir, PC_CONFIG_FILE_NAME));
      if (fs.existsSync(configUrl)) {
        return configUrl.href;
      }
      if (cdir === "/") {
        break;
      }
      cdir = path.dirname(cdir);
    }
    return null;
  };

const isntRoot = (cdir: string) =>
  cdir !== "/" && cdir !== "." && !/^\w+:\\$/.test(cdir);
