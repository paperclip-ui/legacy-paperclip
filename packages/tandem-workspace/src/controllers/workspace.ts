import { Logger } from "@tandem-ui/common";
import * as url from "url";
import { getProjectId, Project } from "./project";
import { SSHKeys } from "./ssh";
import { VFS } from "./vfs";
import { Options } from "../core/options";
import { EngineDelegate } from "@paperclip-ui/core";

export class Workspace {
  private _projects: Record<string, Project> = {};

  constructor(
    private _cwd: string,
    private _ssh: SSHKeys,
    readonly vfs: VFS,
    private _logger: Logger,
    private _engine: EngineDelegate,
    private _options: Options,
    private _httpPort: number
  ) {}

  async start(pathOrUrl: string, branch?: string) {
    const repoUrl = getProjectUrl(pathOrUrl);

    this._logger.info(`Starting repo ${repoUrl}#${branch}`);
    const projectId = getProjectId(repoUrl);
    const project =
      this._projects[projectId] ||
      (this._projects[projectId] = new Project(
        repoUrl,
        branch,
        this.vfs,
        this._logger,
        this._engine,
        this._options,
        this._httpPort
      ));
    return await project.start();
  }

  dispose() {
    for (const id in this._projects) {
      this._projects[id].dispose();
    }
    this._projects = {};
  }

  /**
   */

  async branchProject(project: Project, branch: string) {
    return this.start(project.url, branch);
  }

  /**
   */

  public setSSHKey(privateKey: string) {
    this._ssh.setSSHKey(privateKey);
  }

  getProjectById(id: string) {
    return this._projects[
      id
        ? id
        : !this._options.showFullEditor
        ? Object.keys(this._projects)[0]
        : null
    ];
  }
}

const getProjectUrl = (pathOrUrl: string) => {
  if (pathOrUrl.search(/(git@|file:)/) === 0) {
    return pathOrUrl;
  }

  return url.pathToFileURL(pathOrUrl).href;
};
