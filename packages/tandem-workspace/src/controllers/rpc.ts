import { SocketIo } from "./socket";
import sockjs from "sockjs";
import { channels } from "tandem-designer";
import { Directory, FSItemKind } from "tandem-designer/lib/state";
import { sockAdapter, Channel } from "paperclip-common";
import { Workspace } from "./workspace";
import { isPlainTextFile, Logger } from "tandem-common";
import * as URL from "url";
import * as path from "path";
import * as fs from "fs";
import { engineDelegateChanged, isPaperclipFile } from "paperclip-utils";
import { VFS } from "./vfs";

export class RPC {
  constructor(
    sockio: SocketIo,
    private _workspace: Workspace,
    private _vfs: VFS,
    private _logger: Logger
  ) {
    sockio.on("connection", this._onConnection);
  }
  private _onConnection = (connection: sockjs.Connection) => {
    this._logger.info(`Connection established`);
    new Connection(connection, this._workspace, this._vfs, this._logger);
  };
}

// TODO - need to define workspace ID

class Connection {
  private _events: Channel<any, any>;

  // set from designer
  private _projectId: string;

  private _disposeEngineListener: any;

  constructor(
    connection: sockjs.Connection,
    private _workspace: Workspace,
    private _vfs: VFS,
    private _logger: Logger
  ) {
    const adapter = sockAdapter(connection);
    this._events = channels.eventsChannel(adapter);
    channels.getAllScreensChannel(adapter).listen(this._getAllScreens);
    channels.helloChannel(adapter).listen(this._initialize);
    channels.loadDirectoryChannel(adapter).listen(this._loadDirectory);
    channels.openFileChannel(adapter).listen(this._openFile);
    channels.editCodeChannel(adapter).listen(this._editCode);
    channels.commitChangesChannel(adapter).listen(this._commitChanges);
    channels.setBranchChannel(adapter).listen(this._setBranch);
    channels.editPCSourceChannel(adapter).listen(this._editPCSource);
  }

  private getProject() {
    return this._workspace.getProjectById(this._projectId);
  }

  private _editCode = async ({ uri, value }) => {
    this._vfs.updateFileContent(uri, value);
  };

  private _editPCSource = async ({}) => {
    console.log("TODO");
  };

  private _getAllScreens = async () => {
    const project = this.getProject();
    return project?.getAllPaperclipScreens() || {};
  };
  private _openFile = async ({ uri }) => {
    const project = this.getProject();

    if (isPaperclipFile(uri)) {
      return {
        uri,
        data: project.openPCFile(uri),
        document: project.getPCContent(uri)
      };
    }

    return {
      uri,
      data: null,
      document: isPlainTextFile(uri) ? fs.readFileSync(uri, "utf-8") : null
    };
  };
  private _commitChanges = async ({ description }) => {
    return await this.getProject().commitAndPushChanges(description);
  };
  private _initialize = async ({ projectId }) => {
    this._logger.info(`Setting connection project ID to ${projectId}`);
    this._projectId = projectId;

    const project = this.getProject();

    if (!project) {
      this._logger.info(`Project ID does not exist`);
      return {
        branchInfo: {
          branchable: false,
          branches: [],
          currentBranch: null
        },
        localResourceRoots: []
      };
    }

    this._handleEngineEvents();

    return {
      branchInfo: {
        branches: await project.repository.getBranches(),
        branchable: project.isBranchable(),
        currentBranch: await project.repository.getCurrentBranch()
      },
      localResourceRoots: [project.repository.localDirectory]
    };
  };

  private _handleEngineEvents() {
    if (this._disposeEngineListener) {
      this._disposeEngineListener();
    }

    const project = this.getProject();

    this._disposeEngineListener = project.onPCEngineEvent(event => {
      this._events.call(engineDelegateChanged(event));
    });
  }

  private _setBranch = ({ branchName }) => {
    this.getProject().checkout(branchName);
  };
  private _loadDirectory = async ({
    path: dirPath,
    ...rest
  }): Promise<Directory> => {
    return new Promise((resolve, reject) => {
      fs.readdir(dirPath, (err, basenames) => {
        if (err) {
          return reject(err);
        }

        resolve({
          absolutePath: dirPath,
          url: URL.pathToFileURL(dirPath).toString(),
          kind: FSItemKind.DIRECTORY,
          name: path.basename(dirPath),
          children: basenames.map(basename => {
            const absolutePath = path.join(dirPath, basename);
            const isDir = fs.lstatSync(absolutePath).isDirectory();
            return {
              absolutePath,
              url: URL.pathToFileURL(absolutePath).toString(),
              name: basename,
              kind: isDir ? FSItemKind.DIRECTORY : FSItemKind.FILE,
              children: isDir ? [] : undefined
            };
          })
        });
      });
    });
  };
}