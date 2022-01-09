import * as fs from "fs";
import * as path from "path";
import { CompilerOptions, PC_MODULE_NAMESPACE } from "@paperclip-ui/utils";
import { CompileOptions } from "@paperclip-ui/interim";

type TargetCompiler = {
  compile: (options: CompileOptions) => Record<string, string>;
};

export const requireTargetCompilers = (
  cwd: string,
  options: CompilerOptions
): TargetCompiler[] => {
  const localDirs = [];

  const parts = cwd.split("/");
  parts.shift(); // remove root

  let dir = cwd;

  while (true) {
    localDirs.push(path.join(dir, "node_modules"));
    localDirs.push(path.join(dir, "node_modules", PC_MODULE_NAMESPACE));
    const newDir = path.dirname(dir);
    if (newDir === dir) {
      break;
    }
    dir = newDir;
  }

  const possibleDirs = [
    ...localDirs,
    "/usr/local/lib/node_modules",
    "/usr/local/lib/node_modules/" + PC_MODULE_NAMESPACE
  ];

  const compilers: Record<string, TargetCompiler> = {};

  for (const possibleDir of possibleDirs) {
    if (!fs.existsSync(possibleDir)) {
      continue;
    }

    for (const moduleName of fs.readdirSync(possibleDir)) {
      const modulePath = path.join(possibleDir, moduleName);

      // skip if already used
      if (compilers[moduleName]) {
        continue;
      }

      const isCompilerPrefixed = /^compiler-/.test(moduleName);

      let shouldInclude = false;

      if (
        isCompilerPrefixed &&
        path.basename(path.dirname(modulePath)) === PC_MODULE_NAMESPACE
      ) {
        if (!options.target) {
          shouldInclude = true;
        } else if (
          options.target === moduleName.substring("compiler-".length)
        ) {
          shouldInclude = true;
        }
      } else if (options.target === moduleName) {
        shouldInclude = true;
      }

      if (shouldInclude) {
        compilers[moduleName] = require(modulePath);
      }
    }
  }

  return Object.values(compilers).filter(compiler => compiler.compile != null);
};
