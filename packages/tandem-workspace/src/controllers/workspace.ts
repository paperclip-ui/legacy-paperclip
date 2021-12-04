import { Logger } from "tandem-common";
import { getProjectId, Project } from "./project";
import { SSHKeys } from "./ssh";
import { VFS } from "./vfs";

export class Workspace {
  private _projects: Record<string, Project> = {};

  constructor(
    private _cwd: string,
    private _ssh: SSHKeys,
    private _vfs: VFS,
    private _logger: Logger
  ) {}

  async start(repoUrl: string, branch?: string) {
    this._logger.info(`Starting repo ${repoUrl}#${branch}`);
    const projectId = getProjectId(repoUrl);
    const project =
      this._projects[projectId] ||
      (this._projects[projectId] = new Project(
        repoUrl,
        branch,
        this._vfs,
        this._logger
      ));
    return await project.start();
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
    return this._projects[id];
  }
}
