import * as path from "path";
// import _FileSystem from "fs";
import {
  findPCConfigUrl,
  PaperclipConfig,
  PC_CONFIG_FILE_NAME
} from "paperclip-utils";
import { fileURLToPath, pathToFileURL } from "paperclip-utils/lib/core/url";

type FileSystem = any;

// TODO - move to paperclip-utils as soon as we have a glob library that can handle virtual file systems
const findResourcesFromConfig = (
  getResources: (
    fs: FileSystem
  ) => (config: PaperclipConfig, options: any) => string[]
) => (fs: FileSystem) => (fromUri: string, relative?: boolean) => {
  // symlinks may fudge module resolution, so we need to find the real path
  const fromPath = fs.realpathSync(new URL(fromUri));
  const fromPathDirname = path.dirname(fromPath);
  const configUrl = findPCConfigUrl(fs)(fromUri);

  // If there's no config, then don't bother looking for PC files. Otherwise we're likely
  // to need esoteric logic for resolving PC that I don't think should be supported -- there should
  // just be aproach.
  if (!configUrl) {
    return [];
  }

  const configUri = new URL(configUrl);
  const config: PaperclipConfig = JSON.parse(
    fs.readFileSync(configUri, "utf8")
  );

  return getResources(fs)(config, path.dirname(fileURLToPath(configUri)))
    .filter(pathname => pathname !== fromPath)
    .map(pathname => {
      if (relative) {
        const modulePath = getModulePath(
          configUrl,
          config,
          pathname,
          fromPathDirname
        );

        if (!path.isAbsolute(modulePath)) {
          return modulePath;
        }

        let relativePath = path.relative(fromPathDirname, modulePath);

        if (relativePath.charAt(0) !== ".") {
          relativePath = "./" + relativePath;
        }

        return relativePath;
      }

      return pathToFileURL(pathname).href;
    })
    .map(filePath => {
      return filePath.replace(/\\/g, "/");
    });
};

const resolveModuleRoots = fs => (fromDir: string, roots: string[] = []) => {
  const stat = fs.lstatSync(fromDir);
  const realpath = stat.isSymbolicLink() ? fs.realpathSync(fromDir) : fromDir;
  const newStat = realpath === fromDir ? stat : fs.lstatSync(realpath);
  if (!newStat.isDirectory()) {
    return roots;
  }
  if (fs.existsSync(path.join(fromDir, "package.json"))) {
    roots.push(fromDir);
  } else {
    for (const dirname of fs.readdirSync(realpath)) {
      resolveModuleRoots(fs)(path.join(fromDir, dirname), roots);
    }
  }
  return roots;
};

const filterAllFiles = fs => (filter: (filePath: string) => boolean) => {
  const scan = (currentPath: string, results: string[] = []) => {
    const stat = fs.lstatSync(currentPath);
    const realpath = stat.isSymbolicLink()
      ? fs.realpathSync(currentPath)
      : currentPath;

    const newStat = realpath === currentPath ? stat : fs.lstatSync(realpath);
    if (newStat.isDirectory()) {
      for (const dirname of fs.readdirSync(realpath)) {
        const dirpath = path.join(currentPath, dirname);
        scan(dirpath, results);
      }
    } else {
      if (filter(currentPath)) {
        results.push(currentPath);
      }
    }

    return results;
  };

  return scan;
};

const resolveResources = (fs: FileSystem) => (
  config: PaperclipConfig,
  cwd: string,
  filterFiles: (dir: string) => string[]
) => {
  const sourceDir = config.srcDir === "." ? cwd : path.join(cwd, config.srcDir);
  const filePaths = filterFiles(sourceDir);

  if (config.moduleDirs) {
    for (const modulesDirname of config.moduleDirs) {
      const moduleDirPath = path.join(cwd, modulesDirname);
      const moduleRoots = resolveModuleRoots(fs)(moduleDirPath);
      for (const moduleDir of moduleRoots) {
        // need to scan until there's a package. This covers @organization namespaces.

        if (!moduleDir) {
          continue;
        }

        const pcConfigPath = path.join(moduleDir, PC_CONFIG_FILE_NAME);
        if (!fs.existsSync(pcConfigPath)) {
          continue;
        }
        const moduleConfig: PaperclipConfig = JSON.parse(
          fs.readFileSync(pcConfigPath, "utf8")
        );

        const moduleSources = filterFiles(
          path.join(moduleDir, moduleConfig.srcDir)
        );

        filePaths.push(...moduleSources);
      }
    }
  }

  return filePaths;
};

export const resolveAllPaperclipFiles = findResourcesFromConfig(
  (fs: FileSystem) => (config, cwd) => {
    return resolveResources(fs)(
      config,
      cwd,
      filterAllFiles(fs)(
        filePath =>
          path.extname(filePath) === ".pc" || path.extname(filePath) === ".css"
      )
    );
  }
);
export const resolveAllAssetFiles = findResourcesFromConfig(
  (fs: FileSystem) => (config, cwd) => {
    // const ext = `+(jpg|jpeg|png|gif|svg)`;
    const exts = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".ttf"];

    // const sourceDir = config.srcDir;

    return resolveResources(fs)(
      config,
      cwd,
      filterAllFiles(fs)(filePath => exts.includes(path.extname(filePath)))
    );
    // if (sourceDir === ".") {
    //   return filterAllFiles(filePath => exts.includes(path.extname(filePath)))(cwd);
    //   // return glob.sync(`**/*.${ext}`, { cwd, realpath: true });
    // }

    // // return glob.sync(`${sourceDir}/**/*.${ext}`, { cwd, realpath: true });
    // return filterAllFiles(filePath => exts.includes(path.extname(filePath)))(path.join(cwd, sourceDir));
  }
);

const getModulePath = (
  configUri: string,
  config: PaperclipConfig,
  fullPath: string,
  fromDir?: string
) => {
  const configDir = path.dirname(fileURLToPath(configUri));

  const moduleDirectory = path.join(configDir, config.srcDir) + "/";

  if (fullPath.indexOf(moduleDirectory) === 0) {
    const modulePath = fullPath.replace(moduleDirectory, "");

    const relativePath = fromDir && path.relative(fromDir, fullPath);

    if (relativePath?.match(/\.\.\//g)?.length || 0 > 0) {
      return modulePath;
    }
  }

  if (config.moduleDirs) {
    for (const moduleDirectory of config.moduleDirs) {
      const fullModulePath = path.join(configDir, moduleDirectory);
      if (fullPath.indexOf(fullModulePath) === 0) {
        return fullPath.replace(fullModulePath, "").substr(1);
      }
    }
  }

  return fullPath;
};

// eslint-disable-next-line
export const noop = () => {};
