// Some inspiration from https://github.com/sveltejs/svelte-loader/blob/master/index.js
// License: https://github.com/sveltejs/svelte-loader#license
import {
  Engine,
  PaperclipConfig,
  stringifyCSSSheet,
  getImports,
  getAttributeStringValue,
  resolveImportFile,
  PC_CONFIG_FILE_NAME
} from "paperclip";
import * as loaderUtils from "loader-utils";
import * as resolve from "resolve";
import * as VirtualModules from "webpack-virtual-modules";
import * as path from "path";

let _engine: Engine;

type Options = {
  configFile: string;
  emitCss?: boolean;
};

const getEngine = (): Engine => {
  if (_engine) {
    return _engine;
  }
  return (_engine = new Engine());
};

const virtualModuleInstances = new Map();

const _loadedStyleFiles = {};

module.exports = async function(source: string) {
  if (this._compiler && !virtualModuleInstances.has(this._compiler)) {
    const modules = activatePlugin(new VirtualModules(), this._compiler);
    virtualModuleInstances.set(this._compiler, modules);
  }

  const virtualModules = virtualModuleInstances.get(this._compiler);

  this.cacheable();
  const callback = this.async();
  const resourcePath = this.resourcePath;

  const { configFile = PC_CONFIG_FILE_NAME }: Options =
    loaderUtils.getOptions(this) || {};

  let config: PaperclipConfig;
  const configFilePath = path.join(process.cwd(), configFile);

  try {
    config = require(configFilePath);
  } catch (e) {
    throw new Error(`Config file could not be loaded: ${configFilePath}`);
  }

  const engine = getEngine();
  const compiler = require(resolve.sync(config.compilerOptions.name, {
    basedir: process.cwd()
  }));
  const ast = engine.parseContent(source);
  let code = compiler.compile({ ast }, resourcePath, config.compilerOptions);

  const sheetCode = stringifyCSSSheet(
    engine.evaluateContentStyles(source, resourcePath),
    null
  );

  const imports = getImports(ast);
  for (const imp of imports) {
    const src = getAttributeStringValue("src", imp);
    if (/\.css$/.test(src)) {
      const cssFilePath = resolveImportFile(resourcePath, src);
      if (!_loadedStyleFiles[cssFilePath]) {
        _loadedStyleFiles[cssFilePath] = 1;
        const importedSheetCode = stringifyCSSSheet(
          engine.evaluateFileStyles("file://" + cssFilePath),
          null
        );
        virtualModules.writeModule(cssFilePath, importedSheetCode);
      }
    }
  }

  const cssFileName = `${resourcePath}.css`;
  const sheetFilePath = path.join(path.dirname(resourcePath), cssFileName);
  virtualModules.writeModule(sheetFilePath, sheetCode);
  code = `require("./${cssFileName}");\n${code}`;

  callback(null, code);
};

const activatePlugin = (plugin, compiler) => {
  const { inputFileSystem, name, context, hooks } = compiler;
  plugin.apply({
    inputFileSystem,
    name,
    context,
    hooks: {
      ...hooks,
      afterResolvers: makeImmediateCallbackHook(hooks.afterResolvers),
      afterEnvironment: makeImmediateCallbackHook(hooks.afterEnvironment)
    }
  });
  return plugin;
};

const makeImmediateCallbackHook = hook => ({
  tap: (name: string, callback) => {
    hook.tap(name, callback);
    callback();
  }
});
