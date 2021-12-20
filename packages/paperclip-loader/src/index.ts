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
import * as loaderUtils from "loader-utils";
import VirtualModules from "webpack-virtual-modules-fix-refresh";
import { buildFile } from "paperclip-builder";

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

async function pcLoader(
  source: string,
  virtualModules: VirtualModules,
  resourceUrl: string
) {
  this.cacheable();
  const callback = this.async();

  const ops = { ...loaderUtils.getOptions(this) };

  const { configFile = PC_CONFIG_FILE_NAME }: Options =
    loaderUtils.getOptions(this) || {};

  let config: PaperclipConfig;
  const configFilePath = path.join(process.cwd(), configFile);

  try {
    config = require(configFilePath);
  } catch (e) {
    throw new Error(`Config file could not be loaded: ${configFilePath}`);
  }

  const engine = await getEngine();
  let files: Record<string, string> = {};

  try {
    // need to update virtual content to bust the cache
    await engine.updateVirtualFileContent(resourceUrl, source);
    const result = await buildFile(resourceUrl, engine, {
      config: {
        ...config,
        compilerOptions: {
          ...(config.compilerOptions || {}),
          importAssetsAsModules: true,
          assetOutDir: null,

          // leave this stuff up to Webpack
          embedAssetMaxSize: 0,
          assetPrefix: null
        }
      },
      cwd: process.cwd()
    });
    files = { ...result.translations };
    files[".css"] = result.css;
  } catch (e) {
    // eesh 🙈
    const info = e && e.range ? e : e.info && e.info.range ? e.info : null;
    if (info && info.range) {
      console.error(getPrettyMessage(info, source, resourceUrl, process.cwd()));
    } else {
      console.error(e);
    }

    return callback(
      new Error("Could not compile Paperclip file. See further up for details.")
    );
  }

  const { ".js": js, ...exts } = files;

  for (const ext in exts) {
    let filePath = resourceUrl + ext;

    // covers bug with node@10.13.0 where paths aren't stringified correctly (C:/this/path/is/bad)
    if (process.platform === "win32") {
      filePath = filePath.replace(/\/+/g, "\\");
    }

    const fileUrl = url.fileURLToPath(filePath);
    // console.log(fileUrl);
    virtualModules.writeModule(fileUrl, exts[ext]);
  }
  0;
  callback(null, js);
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

  // console.log(hooks);

  // https://github.com/sysgears/webpack-virtual-modules/issues/86
  // compiler.buildQueue.hooks.beforeAdd.tapAsync(name, (module, cb) => {
  //   console.log(module.resource);
  //   console.log("ADDD");
  //   cb();
  // });

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
