import { Repository } from "./git";
import * as URL from "url";
import * as crypto from "crypto";
import { Logger } from "tandem-common";
import execa from "execa";
import { Package } from "./package";
import { EngineDelegateEvent } from "paperclip";
import { PaperclipProject } from "./paperclip";
import { VFS } from "./vfs";
import { Workspace } from "./workspace";
import { Options } from "../core/options";

export class Project {
  private _pc: PaperclipProject;
  readonly repository: Repository;
  readonly package: Package;

  /**
   */

  constructor(
    readonly url: string,
    private _branch: string,
    _vfs: VFS,
    _logger: Logger,
    private _options: Options
  ) {
    const directory = isUrlLocal(this.url)
      ? URL.fileURLToPath(this.url)
      : getTemporaryDirectory(this.url, this._branch);
    this.repository = new Repository(directory, _logger);
    this.package = new Package(directory, _logger);
    this._pc = new PaperclipProject(
      this.repository.localDirectory,
      _vfs,
      _logger
    );
  }

  /**
   */

  open() {
    execa("open", [
      `http://localhost:${this._options.http.port}?projectId=${this.id}&showAll=true`
    ]);
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

  get id() {
    return getProjectId(this.url);
  }

  /**
   */

  get engine() {
    return this._pc.engine;
  }

  /**
   */

  openPCFile = (uri: string) => {
    return this._pc.engine.open(uri);
  };

  /**
   */

  getPCContent = (uri: string) => {
    return this._pc.engine.getVirtualContent(uri);
  };

  /**
   */

  updatePCContent = (uri: string, content: string) => {
    return this._pc.engine.updateVirtualFileContent(uri, content);
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
    return this._pc.engine.getAllLoadedData();
  }
}

const isUrlLocal = (url: string) => {
  return url.indexOf("file://") === 0;
};

const getTemporaryDirectory = (url: string, branch?: string) => {
  return `/tmp/pc-workspaces/${getProjectId(url)}${branch ? "-" + branch : ""}`;
};

export const getProjectId = (url: string) =>
  crypto
    .createHash("md5")
    .update(url)
    .digest("hex");
