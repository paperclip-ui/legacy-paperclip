import * as path from "path";
import { stripFileProtocol } from "./utils";
import { PC_CONFIG_FILE_NAME } from "./constants";


export const resolveImportUri = fs => (fromPath: string, toPath: string) => {
  const filePath = resolveImportFile(fs)(fromPath, toPath);
  return filePath && "file://" + filePath;
}

export const resolveImportFile = fs => (fromPath: string, toPath: string) => {
  if (/\w+:\/\//.test(toPath)) {
    return toPath;
  }

  if (toPath.charAt(0) !== ".") {
    return resolveModule(fs)(fromPath, toPath) || toPath;
  }

  return path.normalize(
    path.join(stripFileProtocol(path.dirname(fromPath)), toPath)
  );
}

const resolveModule = fs => (fromPath: string, moduleRelativePath: string) => {
  const configPath = findPCConfigPath(fs)(fromPath);
  if (!configPath) return null;

  // need to parse each time in case config changed.
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (!config.moduleDirectories) return null;
  const configPathDir = path.dirname(configPath);
  for (const moduleDirectory of config.moduleDirectories) {
    const moduleFilePath = path.normalize(
      path.join(configPathDir, moduleDirectory, moduleRelativePath)
    );
    if (fs.existsSync(moduleFilePath)) {
      return moduleFilePath;
    }
  }
  return null;
}


const findPCConfigPath = fs => (fromPath: string): string | null => {
  let cdir: string = path.dirname(fromPath.replace("file://", ""));

  // can't cache in case PC config was moved.
  do {    
    const configPath = path.join(cdir, PC_CONFIG_FILE_NAME);
    if (fs.existsSync(configPath)) {
      return configPath;
    }
    cdir = path.dirname(cdir);
  } while (cdir !== "/" && cdir !== ".");
  return null;
}
