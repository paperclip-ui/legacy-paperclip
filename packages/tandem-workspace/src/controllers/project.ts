import execa from "execa";
import { VFS } from "./vfs";
import * as URL from "url";
import * as fs from "fs";
import { Logger } from "@paperclip-ui/common";
import { Options } from "../core/options";
import { Package } from "./package";
import * as crypto from "crypto";
import { Repository } from "./git";
import { PaperclipManager } from "./paperclip";
import { EngineDelegate, EngineDelegateEvent } from "@paperclip-ui/core";
import { EditorHost } from "@paperclip-ui/editor-engine/lib/host/host";
import { PaperclipLanguageService } from "@paperclip-ui/language-service";

export class Project {
  private _pc: PaperclipManager;
  readonly repository: Repository;
  readonly package: Package;
  private _languageService: PaperclipLanguageService;

  /**
   */

  constructor(
    readonly url: string,
    private _branch: string,
    _vfs: VFS,
    _logger: Logger,
    private _engine: EngineDelegate,
    private _options: Options,
    private _httpPort: number,
    documentManager: EditorHost
  ) {
    const directory = isUrlLocal(this.url)
      ? URL.fileURLToPath(this.url)
      : getTemporaryDirectory(this.url, this._branch);
    this.repository = new Repository(directory, _logger);
    this.package = new Package(directory, _logger);
    this._languageService = new PaperclipLanguageService(_engine, fs as any);
    this._pc = new PaperclipManager(
      this.repository.localDirectory,
      _vfs,
      _logger,
      _engine,
      documentManager
    );
  }

  /**
   */

  getLanguageService() {
    return this._languageService;
  }

  /**
   */

  getEngine() {
    return this._engine;
  }

  /**
   */

  dispose() {
    this._pc.dispose();
  }

  /**
   */

  openBrowser() {
    // TODO - remove embedded flag
    execa("open", [
      `http://localhost:${
        this._httpPort
      }?projectId=${this.getId()}&showAll=true`,
    ]).catch(() => {
      console.warn(`Unable to launch browser`);
    });
  }

  /**
   * branchable directores are only available for projects
   * initialized from GIT repository since Tandem creates physically
   * new directories for each branch
   */

  isBranchable() {
    return !isUrlLocal(this.url);
  }

  /**
   */

  async commitAndPushChanges(description: string) {
    await this.repository.addAllChanges();
    await this.repository.commit(description);
    await this.repository.push();
  }

  /**
   */

  async checkout(branchName: string) {
    await this.repository.checkout(branchName);
  }

  /**
   */

  getId() {
    return getProjectId(this.url);
  }

  /**
   */

  openPCFile = (uri: string) => {
    return this._engine.open(uri);
  };

  /**
   */

  getPCContent = (uri: string) => {
    return this._engine.getVirtualContent(uri);
  };

  /**
   */

  updatePCContent = (uri: string, content: string) => {
    return this._engine.updateVirtualFileContent(uri, content);
  };

  /**
   */

  async start() {
    if (!isUrlLocal(this.url)) {
      await this.repository.clone(this.url);
      await this.repository.checkout(this._branch);
    }

    if (this._options.project?.installDependencies !== false) {
      await this.package.install();
    }

    // start the PC engine. At this point we're ready to start working
    this._pc.start();

    return this;
  }

  /**
   */

  async pushAllChanges(message: string) {
    // save files stored in PC engine locally
    this._pc.saveLocally();

    // save all changes
    await this.repository.add("-A");
    await this.repository.commit(message);

    // need to be cognizant of rejections here. In that case, should
    // create new branch, push to that, and prompt user to fix using CLI
    await this.repository.push();
  }

  /**
   */

  onPCEngineEvent = (listener: (event: EngineDelegateEvent) => void) => {
    return this._pc.onEngineEvent(listener);
  };

  /**
   */

  getAllPaperclipScreens() {
    return this._engine.getAllLoadedData();
  }
}

const isUrlLocal = (url: string) => {
  return url.indexOf("file://") === 0;
};

const getTemporaryDirectory = (url: string, branch?: string) => {
  return `/tmp/pc-workspaces/${getProjectId(url)}${branch ? "-" + branch : ""}`;
};

export const getProjectId = (url: string) =>
  crypto.createHash("md5").update(url).digest("hex");
