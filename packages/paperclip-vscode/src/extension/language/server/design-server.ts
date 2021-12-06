import { eventHandlers, Observable, Observer } from "paperclip-common";
const getPort = require("get-port");
import {
  DesignServerStarted,
  DesignServerUpdated,
  DesignServerUpdating,
  Initialized,
  ProjectStarted,
  TextDocumentChanged,
  TextDocumentOpened
} from "./events";
import {
  start as startWorkspace,
  Workspace,
  Project
} from "tandem-workspace/lib/server";

const UPDATE_THROTTLE = 10;

export class PaperclipDesignServer implements Observer {
  readonly events: Observable;
  // private _engine: EngineDelegate;
  private _workspace: Workspace;
  private _project: Project;
  private _windowFocused: boolean;
  private _latestDocuments: Record<string, string>;
  private _updatingDocuments: boolean;
  private _port: number;

  constructor() {
    this.events = new Observable();
  }

  private _start = async ({ workspaceFolders }: Initialized) => {
    this._workspace = await startWorkspace({
      http: {
        port: this._port = await getPort()
      },
      project: {
        installDependencies: false
      }
    });
    this.events.dispatch(new DesignServerStarted(this._port));

    const cwd = workspaceFolders[0].uri;
    this._project = await this._workspace.start(cwd);
    this.events.dispatch(new ProjectStarted(this._project));
  };

  private _onTextDocumentOpened = ({ uri, content }: TextDocumentOpened) => {
    // this will happen if text document is open on vscode open
    if (!this._project) {
      return;
    }
    this._project.updatePCContent(uri, content);
  };
  private _onTextDocumentChanged = ({ uri, content }: TextDocumentChanged) => {
    if (this._windowFocused || !this._project) {
      return;
    }

    if (this._updatingDocuments) {
      this._latestDocuments[uri] = content;
      return;
    }

    this.events.dispatch(new DesignServerUpdating());

    this._updatingDocuments = true;
    this._latestDocuments = {
      [uri]: content
    };

    // throttle for updating doc to ensure that the engine doesn't
    // get flooded
    setTimeout(() => {
      const changes = this._latestDocuments;
      this._latestDocuments = {};
      for (const uri in changes) {
        this._project.updatePCContent(uri, changes[uri]);
      }
      this.events.dispatch(new DesignServerUpdated());
      this._updatingDocuments = false;
    }, UPDATE_THROTTLE);
  };

  // private _onWindowFocused = () => {
  //   this._windowFocused = true;
  // };

  // private _onWindowBlurred = () => {
  //   this._windowFocused = false;
  // };

  handleEvent = eventHandlers({
    [Initialized.TYPE]: this._start,
    [TextDocumentOpened.TYPE]: this._onTextDocumentOpened,
    [TextDocumentChanged.TYPE]: this._onTextDocumentChanged
    // [ActionType.WINDOW_FOCUSED]: this._onWindowFocused,
    // [ActionType.WINDOW_BLURRED]: this._onWindowBlurred
  });
}
