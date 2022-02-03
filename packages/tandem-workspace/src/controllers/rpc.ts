import { RPCClientAdapter, RPCServer } from "@paperclip-ui/common";
import * as channels from "@tandem-ui/workspace-core/lib/channels";
import { Channel } from "@paperclip-ui/common";
import { Workspace } from "./workspace";
import { isPlainTextFile } from "@tandem-ui/common";
import * as URL from "url";
import * as fs from "fs";
import {
  engineDelegateChanged,
  Expression,
  isPaperclipFile,
  NodeStyleInspection,
  VirtNodeSource,
} from "@paperclip-ui/utils";
import { VFS } from "./vfs";
import { exec } from "child_process";
import { Options } from "../core/options";
import { Logger } from "@paperclip-ui/common";
import { EngineDelegate, paperclipSourceGlobPattern } from "@paperclip-ui/core";
import { VirtualNodeSourceInfo } from "@paperclip-ui/core/src/core/delegate";
import globby from "globby";

// TODO - this needs to be moved to project RPC
export class RPC {
  constructor(
    server: RPCServer,
    private _workspace: Workspace,
    private _vfs: VFS,
    private _logger: Logger,
    private _httpPort: number,
    private _options: Options
  ) {
    server.onConnection(this._onConnection);
  }
  private _onConnection = (connection: RPCClientAdapter) => {
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
    connection: RPCClientAdapter,
    private _workspace: Workspace,
    private _vfs: VFS,
    private _logger: Logger,
    private _httpPort: number,
    private _options: Options
  ) {
    this._events = channels.eventsChannel(connection);
    channels.getAllScreensChannel(connection).listen(this._getAllScreens);
    channels
      .loadVirtualNodeSourcesChannel(connection)
      .listen(this._loadNodeSources);
    channels.helloChannel(connection).listen(this._initialize);
    channels
      .loadInsertableNodesChannel(connection)
      .listen(this._loadInsertableNodes);
    // channels.loadDirectoryChannel(connection).listen(this._loadDirectory);
    channels.openProjectChannel(connection).listen(this._openProject);
    channels
      .getAllPaperclipFilesChannel(connection)
      .listen(this._getAllPaperclipFiles);

    // TODO
    channels.inspectNodeStyleChannel(connection).listen(this._inspectNode);
    channels.revealNodeSourceChannel(connection).listen(this._revealSource);
    channels
      .revealNodeSourceByIdChannel(connection)
      .listen(this._revealSourceById);
    channels.popoutWindowChannel(connection).listen(this._popoutWindow);
    channels.openFileChannel(connection).listen(this._openFile);
    channels.commitChangesChannel(connection).listen(this._commitChanges);
    // channels.setBranchChannel(connection).listen(this._setBranch);
    // channels.editPCSourceChannel(connection).listen(this._editPCSource);
  }

  private getProject() {
    return this._workspace.getProjectById(this._projectId);
  }

  private _getAllPaperclipFiles = async ({ projectId }) => {
    const project = this._workspace.getProjectById(projectId);
    const filePaths = await globby(
      paperclipSourceGlobPattern(project.repository.localDirectory),
      {
        cwd: project.repository.localDirectory,
        ignore: ["**/node_modules/**"],
        gitignore: true,
      }
    );
    return filePaths.map((filePath) => URL.pathToFileURL(filePath).href);
  };

  private _openProject = async ({ id, uri, branch }) => {
    const project = id
      ? this._workspace.getProjectById(id)
      : await this._workspace.start(uri, branch);

    return {
      id: project.getId(),
      directoryPath: project.repository.localDirectory,
      directoryUri: URL.pathToFileURL(
        project.repository.localDirectory
      ).toString(),
    };
  };

  private _editCode = async ({ uri, value }) => {
    this._vfs.updateFileContent(uri, value);
  };

  private _revealSource = async (source: VirtNodeSource) => {
    const project = this.getProject();
    const info = project
      .getEngine()
      .getVirtualNodeSourceInfo(source.path, source.uri);

    if (info) {
      this._options.adapter?.revealSource(info);
    } else {
      console.error(
        `Could not find node source: `,
        JSON.stringify(source, null, 2)
      );
    }
  };

  private _revealSourceById = async (sourceId: string) => {
    const project = this.getProject();
    const [uri, expr] = project.getEngine().getExpressionById(sourceId) as [
      string,
      Expression
    ];

    this._options.adapter?.revealSource({
      sourceId,
      textSource: {
        range: expr.range,
        uri,
      },
    });
  };

  private _loadNodeSources = async (
    sources: VirtNodeSource[]
  ): Promise<VirtualNodeSourceInfo[]> => {
    const project = this.getProject();

    return sources.map((info) => {
      return project.getEngine().getVirtualNodeSourceInfo(info.path, info.uri);
      // return {
      //   virtualNodePath: info.path,
      //   sourceId: this._engine.getVirtualNodeSourceInfo(info.path, info.uri).sourceId
      // };
    });
  };

  private _popoutWindow = async ({ path }) => {
    let host = `http://localhost:${this._httpPort}`;
    let url = host + path;
    exec(`open "${url}"`);
  };

  private _inspectNode = async (
    sources: VirtNodeSource[]
  ): Promise<Array<[VirtNodeSource, NodeStyleInspection]>> => {
    const project = this.getProject();
    return sources.map((source) => [
      source,
      project.getEngine().inspectNodeStyles(source, 0),
    ]);
  };

  private _getAllScreens = async () => {
    const project = this.getProject();
    return project?.getAllPaperclipScreens() || {};
  };
  private _openFile = async ({ uri }) => {
    const project = this.getProject();

    if (isPaperclipFile(uri)) {
      const data = project.openPCFile(uri);
      return {
        uri,
        data: project.openPCFile(uri),
        document: project.getPCContent(uri),
      };
    }

    return {
      uri,
      data: null,
      document: isPlainTextFile(uri) ? fs.readFileSync(uri, "utf-8") : null,
    };
  };
  private _commitChanges = async ({ description }) => {
    return await this.getProject().commitAndPushChanges(description);
  };
  private _loadInsertableNodes = async ({ activeUri }) => {
    const project = this.getProject();
    return project.getLanguageService().getAllAvailableNodes({ activeUri });
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
          currentBranch: null,
        },
        localResourceRoots: [],
      };
    }

    this._handleEngineEvents();

    return {
      showFullEditor: this._options.showFullEditor,
      canvasFile: this._options.canvasFile,
      branchInfo: {
        branches: await project.repository.getBranches(),
        branchable: project.isBranchable(),
        currentBranch: await project.repository.getCurrentBranch(),
      },
      localResourceRoots: [project.repository.localDirectory],
    };
  };

  private _handleEngineEvents() {
    if (this._disposeEngineListener) {
      this._disposeEngineListener();
    }

    const project = this.getProject();

    this._disposeEngineListener = project.onPCEngineEvent((event) => {
      this._events.call(engineDelegateChanged(event));
    });
  }

  private _setBranch = ({ branchName }) => {
    this.getProject().checkout(branchName);
  };
  // private _loadDirectory = async ({
  //   path: dirPath,
  //   ...rest
  // }): Promise<Directory> => {
  //   return new Promise((resolve, reject) => {
  //     fs.readdir(dirPath, (err, basenames) => {
  //       if (err) {
  //         return reject(err);
  //       }

  //       resolve({
  //         absolutePath: dirPath,
  //         url: URL.pathToFileURL(dirPath).toString(),
  //         kind: FSItemKind.DIRECTORY,
  //         name: path.basename(dirPath),
  //         children: basenames.map((basename) => {
  //           const absolutePath = path.join(dirPath, basename);
  //           const isDir = fs.lstatSync(absolutePath).isDirectory();
  //           return {
  //             absolutePath,
  //             url: URL.pathToFileURL(absolutePath).toString(),
  //             name: basename,
  //             kind: isDir ? FSItemKind.DIRECTORY : FSItemKind.FILE,
  //             children: isDir ? [] : undefined,
  //           };
  //         }),
  //       });
  //     });
  //   });
  // };
}
