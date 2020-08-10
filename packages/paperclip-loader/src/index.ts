// Some inspiration from https://github.com/sveltejs/svelte-loader/blob/master/index.js
// License: https://github.com/sveltejs/svelte-loader#license
import * as url from "url";
import {
  Engine,
  PaperclipConfig,
  stringifyCSSSheet,
  PC_CONFIG_FILE_NAME
} from "paperclip";
import * as path from "path";
import * as resolve from "resolve";
import * as loaderUtils from "loader-utils";
import * as VirtualModules from "webpack-virtual-modules";

let _engine: Engine;

type Options = {
  configFile: string;
  emitCss?: boolean;
};

const getEngine = (): Engine => {
  if (_engine) {
    return _engine;
  }
  return (_engine = new Engine({}));
};

const virtualModuleInstances = new Map();

const fixPath = path => path.replace(/\\/g, "/");

let _loadedStyleFiles = {};

async function pcLoader(
  source: string,
  virtualModules: VirtualModules,
  resourceUrl: string
) {
  this.cacheable();
  const callback = this.async();

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

  // need to update virtual content to bust the cache
  await engine.updateVirtualFileContent(resourceUrl, source);
  const ast = engine.parseContent(source);
  const { sheet, exports } = await engine.run(resourceUrl);

  const styleCache = { ..._loadedStyleFiles };
  _loadedStyleFiles = styleCache;

  let code = compiler.compile(
    { ast, classNames: exports.style.classNames },
    resourceUrl,
    config.compilerOptions
  );

  const sheetCode = stringifyCSSSheet(sheet, null, resourceUrl);

  const sheetFilePath = url.fileURLToPath(`${resourceUrl}.css`);
  const sheetFileName = path.basename(sheetFilePath);

  // covers bug with node@10.13.0 where
  virtualModules.writeModule(sheetFilePath.replace(/\/+/g, "\\"), sheetCode);
  code = `import "./${sheetFileName}";\n${code}`;

  callback(null, code);
}

module.exports = function(source: string) {
  if (this._compiler && !virtualModuleInstances.has(this._compiler)) {
    const modules = activatePlugin(new VirtualModules(), this._compiler);
    virtualModuleInstances.set(this._compiler, modules);
  }

  const virtualModules = virtualModuleInstances.get(this._compiler);

  const resourcePath = this.resourcePath;
  const resourceUrl = url.pathToFileURL(resourcePath).href;
  return pcLoader.call(this, source, virtualModules, resourceUrl);
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
