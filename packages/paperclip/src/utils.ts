import * as path from "path";
import * as glob from "glob";
import * as url from "url";
import {
  findPCConfigUrl,
  PaperclipConfig,
  paperclipSourceGlobPattern
} from "paperclip-utils";

// TODO - move to paperclip-utils as soon as we have a glob library that can handle virtual file systems
const findResourcesFromConfig = (
  get: (config: PaperclipConfig, options: any) => string[]
) => fs => (fromUri: string, relative?: boolean) => {
  // symlinks may fudge module resolution, so we need to find the real path
  const fromPath = fs.realpathSync(new URL(fromUri).pathname);
  const fromPathDirname = path.dirname(fromPath);
  const configUrl = findPCConfigUrl(fs)(fromUri);

  // If there's no config, then don't bother looking for PC files. Otherwise we're likely
  // to need esoteric logic for resolving PC that I don't think should be supported -- there should
  // just be aproach.
  if (!configUrl) {
    return [];
  }

  const configPath = new URL(configUrl).pathname;
  const config: PaperclipConfig = JSON.parse(
    fs.readFileSync(configPath, "utf8")
  );

  return get(config, path.dirname(configPath))
    .filter(pathname => pathname !== fromPath)
    .map(pathname => {
      if (relative) {
        const modulePath = getModulePath(
          configUrl,
          config,
          pathname,
          fromPathDirname
        );
        if (modulePath.charAt(0) !== "/") {
          return modulePath;
        }

        let relativePath = path.relative(fromPathDirname, modulePath);

        if (relativePath.charAt(0) !== ".") {
          relativePath = "./" + relativePath;
        }

        return relativePath;
      }

      return url.pathToFileURL(pathname).href;
    });
};

export const resolveAllPaperclipFiles = findResourcesFromConfig(
  (config, cwd) => {
    return glob.sync(paperclipSourceGlobPattern(config.sourceDirectory), {
      cwd,
      realpath: true
    });
  }
);
export const resolveAllAssetFiles = findResourcesFromConfig((config, cwd) => {
  const ext = `+(jpg|jpeg|png|gif|svg)`;

  const sourceDir = config.sourceDirectory;
  if (sourceDir === ".") {
    return glob.sync(`**/*.${ext}`, { cwd, realpath: true });
  }

  return glob.sync(`${sourceDir}/**/*.${ext}`, { cwd, realpath: true });
});

const getModulePath = (
  configUri: string,
  config: PaperclipConfig,
  fullPath: string,
  fromDir?: string
) => {
  const configDir = path.dirname(new URL(configUri).pathname);

  const moduleDirectory = path.join(configDir, config.sourceDirectory) + "/";

  if (fullPath.indexOf(moduleDirectory) === 0) {
    const modulePath = fullPath.replace(moduleDirectory, "");

    const nextDirectory =
      path.join(moduleDirectory, modulePath.split("/")[0]) + "/";

    if (!fromDir || fromDir.indexOf(nextDirectory) === -1) {
      return modulePath;
    }
  }

  return fullPath;
};

// eslint-disable-next-line
export const noop = () => {};
