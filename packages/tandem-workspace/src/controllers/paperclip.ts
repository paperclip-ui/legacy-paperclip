import {
  EngineDelegate,
  createEngineDelegate,
  EngineMode,
  PaperclipConfig,
  PC_CONFIG_FILE_NAME,
  PaperclipResourceWatcher,
  ChangeKind,
  EngineDelegateEvent,
  paperclipResourceGlobPattern,
  isPaperclipFile,
} from "paperclip";
import * as fs from "fs";
import * as path from "path";
import { Logger } from "tandem-common";
import * as glob from "glob";
import * as url from "url";
import { VFS } from "./vfs";

export class PaperclipProject {
  private _watcher: PaperclipResourceWatcher;
  private _engine: EngineDelegate;

  constructor(
    private _cwd: string,
    private _vfs: VFS,
    private _logger: Logger
  ) {
    this._startEngine();
  }

  /**
   */

  start() {
    const config = readConfig(this._cwd, this._logger);
    this._startEngine();
    this._startWatcher(config);
    this._addAllProjects(config);
  }

  /**
   */

  getAllScreens() {
    return this._engine.getAllLoadedData();
  }

  /**
   */

  openFile(uri: string) {
    return this._engine.open(uri);
  }

  /**
   */

  getVirtContent(uri: string) {
    return this._engine.getVirtualContent(uri);
  }

  /**
   */

  saveLocally() {}

  /**
   */

  onEngineEvent = (listener: (event: EngineDelegateEvent) => void) => {
    return this._engine.onEvent(listener);
  };

  /**
   */

  private _addAllProjects(config: PaperclipConfig) {
    const pcFiles = glob.sync(
      paperclipResourceGlobPattern(path.join(this._cwd, config.sourceDirectory))
    );
    for (const pcFile of pcFiles) {
      if (isPaperclipFile(pcFile)) {
        this._logger.verbose(`Opening ${pcFile}`);
        try {
          this._engine.open(url.pathToFileURL(pcFile).href);
        } catch (e) {
          this._logger.warn(e);
        }
      }
    }
  }

  /**
   * @deprecated should use generic file watcher and pass to VFS
   */

  private _startWatcher(config: PaperclipConfig) {
    if (this._watcher) {
      this._watcher.dispose();
    }
    this._watcher = new PaperclipResourceWatcher(config, this._cwd);
    this._watcher.onChange((kind: ChangeKind, fileUrl: string) => {
      this._engine.updateVirtualFileContent(
        fileUrl,
        fs.readFileSync(url.fileURLToPath(fileUrl), "utf-8")
      );
      this._logger.info(`Local file changed: ${fileUrl}`);
    });
  }

  /**
   */

  private _startEngine() {
    if (this._engine) {
      return;
    }

    this._logger.info(`Starting PC engine`);

    this._engine = createEngineDelegate(
      {
        mode: EngineMode.MultiFrame,
      },
      () => {
        this._engine = undefined;
        disposeVFSChangeListener();
        this._logger.error(`PC engine crashed`);
        this._startEngine();
      }
    );

    const disposeVFSChangeListener = this._vfs.onChange((uri, content) => {
      if (isPaperclipFile(uri)) {
        this._logger.info(`Updating PC content for ${uri}`);
        this._engine.updateVirtualFileContent(uri, content);
      }
    });

    this._engine.onEvent(this._onEngineEvent);
  }

  /**
   */

  private _onEngineEvent = (event: EngineDelegateEvent) => {};
}

const readConfig = (cwd: string, logger: Logger) => {
  const configPath = path.join(cwd, PC_CONFIG_FILE_NAME);
  let config: PaperclipConfig = null;

  if (!fs.existsSync(configPath)) {
    logger.warn(`PC config not found, using default values`);
    config = {
      srcDir: ".",
    };
  } else {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }

  return config;
};
