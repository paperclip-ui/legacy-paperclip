import { SocketIo } from "./socket";
import sockjs from "sockjs";
import { channels } from "@tandemui/designer";
import { Directory, FSItemKind } from "@tandemui/designer/lib/state";
import { sockAdapter, Channel } from "@paperclipui/common";
import { Workspace } from "./workspace";
import { isPlainTextFile, Logger } from "@tandemui/common";
import * as URL from "url";
import * as path from "path";
import * as fs from "fs";
import {
  engineDelegateChanged,
  Expression,
  isPaperclipFile,
  VirtNodeSource
} from "@paperclipui/utils";
import { VFS } from "./vfs";
import { PCMutation, PCSourceWriter } from "@paperclipui/source-writer";
import { exec } from "child_process";
import { Options } from "../core/options";

export class RPC {
  constructor(
    sockio: SocketIo,
    private _workspace: Workspace,
    private _vfs: VFS,
    private _logger: Logger,
    private _httpPort: number,
    private _options: Options
  ) {
    sockio.on("connection", this._onConnection);
  }
  private _onConnection = (connection: sockjs.Connection) => {
    this._logger.info(`Connection established`);
    new Connection(
      connection,
      this._workspace,
      this._vfs,
      this._logger,
      this._httpPort,
      this._options
    );
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
    private _logger: Logger,
    private _httpPort: number,
    private _options: Options
  ) {
    const adapter = sockAdapter(connection);
    this._events = channels.eventsChannel(adapter);
    channels.getAllScreensChannel(adapter).listen(this._getAllScreens);
    channels
      .loadVirtualNodeSourcesChannel(adapter)
      .listen(this._loadNodeSources);
    channels.helloChannel(adapter).listen(this._initialize);
    channels.loadDirectoryChannel(adapter).listen(this._loadDirectory);
    channels.inspectNodeStyleChannel(adapter).listen(this._inspectNode);
    channels.revealNodeSourceChannel(adapter).listen(this._revealSource);
    channels
      .revealNodeSourceByIdChannel(adapter)
      .listen(this._revealSourceById);
    channels.popoutWindowChannel(adapter).listen(this._popoutWindow);
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

  // TODO - need to remove this eventually in favor of CRDT document sync

  private _editPCSource = async (mutations: PCMutation[]) => {
    const writer = new PCSourceWriter(this.getProject().engine);
    const changes = writer.apply(mutations);
    this._options.adapter?.applyCodeChanges(changes);
  };

  private _revealSource = (source: VirtNodeSource) => {
    const info = this.getProject().engine.getVirtualNodeSourceInfo(
      source.path,
      source.uri
    );

    if (info) {
      this._options.adapter?.revealSource(info);
    } else {
      console.error(
        `Could not find node source: `,
        JSON.stringify(source, null, 2)
      );
    }
  };

  private _revealSourceById = (sourceId: string) => {
    const [uri, expr] = this.getProject().engine.getExpressionById(
      sourceId
    ) as [string, Expression];

    this._options.adapter?.revealSource({
      sourceId,
      textSource: {
        range: expr.range,
        uri
      }
    });
  };

  private _loadNodeSources = (sources: VirtNodeSource[]) => {
    const project = this.getProject();

    return sources.map(info => {
      return {
        virtualNodePath: info.path,
        source: project.engine.getVirtualNodeSourceInfo(info.path, info.uri)
      };
    });
  };

  private _popoutWindow = ({ path }) => {
    let host = `http://localhost:${this._httpPort}`;
    let url = host + path;
    exec(`open "${url}"`);
  };

  private _inspectNode = (sources: VirtNodeSource[]) => {
    const project = this.getProject();
    return sources.map(source => [
      source,
      project.engine.inspectNodeStyles(source, 0)
    ]);
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
        showFullEditor: this._options.showFullEditor,
        canvasFile: this._options.canvasFile,
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
      showFullEditor: this._options.showFullEditor,
      canvasFile: this._options.canvasFile,
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
