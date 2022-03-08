import {
  EngineDelegate,
  PaperclipConfig,
  PC_CONFIG_FILE_NAME,
  PaperclipResourceWatcher,
  ChangeKind,
  EngineDelegateEvent,
  paperclipSourceGlobPattern,
  isPaperclipFile,
} from "@paperclip-ui/core";
import * as fs from "fs";
import * as path from "path";
import { Logger } from "@paperclip-ui/common";
import globby from "globby";
import * as url from "url";
import { VFS } from "./vfs";
import { EditorHost } from "@paperclip-ui/editor-engine/lib/host/host";

export class PaperclipManager {
  private _watcher: PaperclipResourceWatcher;

  constructor(
    private _cwd: string,
    private _vfs: VFS,
    private _logger: Logger,
    private _engine: EngineDelegate,
    private _documentManager: EditorHost
  ) {}

  /**
   */

  async start() {
    const config = readConfig(this._cwd, this._logger);
    this._startWatcher(config);
    await this._addAllProjects(config);
  }

  /**
   */

  saveLocally() {}

  /**
   */

  onEngineEvent = (listener: (event: EngineDelegateEvent) => void) => {
    return this._engine.onEvent(listener);
  };

  dispose() {
    this._watcher.dispose();
  }

  /**
   */
  2;
  private async _addAllProjects(config: PaperclipConfig) {
    const ms = Date.now();
    this._logger.verbose(`Opening all Paperclip files`);

    const pcFiles = await globby(
      paperclipSourceGlobPattern(path.join(this._cwd, config.srcDir)),
      {
        gitignore: true,
        ignore: ["**/node_modules/**"],
        followSymbolicLinks: true,
        cwd: this._cwd,
      }
    );

    this._logger.verbose(
      `Done scanning all PC files (${pcFiles.length}) in ${
        (Date.now() - ms) / 1000
      }s`
    );

    for (const pcFile of pcFiles) {
      if (isPaperclipFile(pcFile)) {
        try {
          const data = this._engine.open(url.pathToFileURL(pcFile).href);
        } catch (e) {
          // this._logger.warn(e);
        }
      }
    }
    this._logger.verbose(
      `Done opening ${pcFiles.length} PC files in ${(Date.now() - ms) / 1000}s`
    );
  }

  /**
   * @deprecated should use generic file watcher and pass to VFS
   */

  private _startWatcher(config: PaperclipConfig) {
    if (this._watcher) {
      this._watcher.dispose();
    }
    this._watcher = new PaperclipResourceWatcher(config.srcDir, this._cwd);
    this._watcher.onChange((kind: ChangeKind, fileUrl: string) => {
      // Hard reload
      const doc = this._documentManager.getDocumentManager().open(fileUrl);
      const source = doc.openSource();
      const content = fs.readFileSync(url.fileURLToPath(fileUrl), "utf-8");

      if (source.getText() !== content) {
        source.setText(content.split(""), 0, source.getText().length);
        this._logger.info(`Local file changed: ${fileUrl}`);
      }
    });
  }

  /**
   */

  // private _startEngine() {
  //   if (this._engine) {
  //     return;
  //   }

  //   this._logger.info(`Starting PC engine`);

  //   this._engine = createEngineDelegate(
  //     {
  //       mode: EngineMode.MultiFrame
  //     },
  //     () => {
  //       this._engine = undefined;
  //       disposeVFSChangeListener();
  //       this._logger.error(`PC engine crashed`);
  //       this._startEngine();
  //     }
  //   );

  //   const disposeVFSChangeListener = this._vfs.onChange((uri, content) => {
  //     if (isPaperclipFile(uri)) {
  //       this._logger.info(`Updating PC content for ${uri}`);
  //       this._engine.updateVirtualFileContent(uri, content);
  //     }
  //   });

  //   this._engine.onEvent(this._onEngineEvent);
  // }

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
