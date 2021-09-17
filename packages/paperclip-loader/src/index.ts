// Some inspiration from https://github.com/sveltejs/svelte-loader/blob/master/index.js
// License: https://github.com/sveltejs/svelte-loader#license
import * as url from "url";
import {
  EngineDelegate,
  createEngineDelegate,
  PaperclipConfig,
  stringifyCSSSheet,
  PC_CONFIG_FILE_NAME
} from "paperclip";
import { getPrettyMessage } from "paperclip-cli-utils";
import * as path from "path";
import * as resolve from "resolve";
import * as loaderUtils from "loader-utils";
import VirtualModules from "webpack-virtual-modules";
import { LoadedData, getStyleExports } from "paperclip";

let _engine: EngineDelegate;

type Options = {
  configFile: string;
  resourceProtocol?: string;
};

const getEngine = async (): Promise<EngineDelegate> => {
  if (_engine) {
    return _engine;
  }
  return (_engine = await createEngineDelegate({}));
};

const virtualModuleInstances = new Map();

let _loadedStyleFiles = {};

async function pcLoader(
  source: string,
  virtualModules: VirtualModules,
  resourceUrl: string
) {
  this.cacheable();
  const callback = this.async();

  const { resourceProtocol, configFile = PC_CONFIG_FILE_NAME }: Options =
    loaderUtils.getOptions(this) || {};

  let config: PaperclipConfig;
  const configFilePath = path.join(process.cwd(), configFile);

  try {
    config = require(configFilePath);
  } catch (e) {
    throw new Error(`Config file could not be loaded: ${configFilePath}`);
  }

  const engine = await getEngine();
  const compiler = require(resolve.sync(config.compilerOptions.name, {
    basedir: process.cwd()
  }));
  let info: LoadedData;
  let ast: any;

  try {
    // need to update virtual content to bust the cache
    await engine.updateVirtualFileContent(resourceUrl, source);
    ast = await engine.parseContent(source, resourceUrl);

    info = await engine.open(resourceUrl);
  } catch (e) {
    // eesh 🙈
    const info =
      e && e.location ? e : e.info && e.info.location ? e.info : null;
    if (info && info.location) {
      console.error(getPrettyMessage(info, source, resourceUrl, process.cwd()));
    }

    return callback(
      new Error("Could not compile Paperclip file. See further up for details.")
    );
  }

  const { sheet } = info;

  const styleCache = { ..._loadedStyleFiles };
  _loadedStyleFiles = styleCache;

  let sheetFilePath = url.fileURLToPath(`${resourceUrl}.css`);
  const sheetFileName = path.basename(sheetFilePath);

  const code = compiler.compile(
    {
      ast,
      classNames: getStyleExports(info).classNames,
      sheetRelativeFilePath: `./${sheetFileName}`
    },
    resourceUrl,
    config.compilerOptions
  );

  const sheetCode = stringifyCSSSheet(sheet, {
    uri: resourceUrl,
    resolveUrl:
      resourceProtocol && (url => url.replace("file:", resourceProtocol))
  });

  // covers bug with node@10.13.0 where paths aren't stringified correctly (C:/this/path/is/bad)
  if (process.platform === "win32") {
    sheetFilePath = sheetFilePath.replace(/\/+/g, "\\");
  }

  virtualModules.writeModule(sheetFilePath, sheetCode);

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
