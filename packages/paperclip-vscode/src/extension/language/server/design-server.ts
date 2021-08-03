import { eventHandlers, Observable, Observer } from "paperclip-common";
import {
  DesignServerUpdated,
  DesignServerUpdating,
  Initialized,
  TextDocumentChanged,
  TextDocumentOpened
} from "./events";
import { ActionType, startServer } from "paperclip-designer";
import { PCEngineInitialized } from "paperclip-designer/lib/server/services/pc-engine";
import * as URL from "url";
import { ExprSource } from "paperclip-utils";
import { RevealSourceRequested } from "./events";
import { EngineDelegate } from "paperclip";

const UPDATE_THROTTLE = 10;

export class PaperclipDesignServer implements Observer {
  readonly events: Observable;
  private _engine: EngineDelegate;
  private _windowFocused: boolean;
  private _latestDocuments: Record<string, string>;
  private _updatingDocuments: boolean;

  constructor() {
    this.events = new Observable();
  }

  private _start = async ({ workspaceFolders }: Initialized) => {
    await startServer({
      localResourceRoots: workspaceFolders.map(({ uri }) => {
        return URL.fileURLToPath(uri);
      }),
      readonly: false,
      openInitial: false,
      revealSource: (source: ExprSource) => {
        this.events.dispatch(new RevealSourceRequested(source));
      },
      handleEvent: event => {
        this.events.dispatch(event);
      }
    });
  };

  private _onEngineInitialized = ({ engine }: PCEngineInitialized) => {
    this._engine = engine;
  };

  private _onTextDocumentOpened = ({ uri, content }: TextDocumentOpened) => {
    this._engine.updateVirtualFileContent(uri, content);
  };
  private _onTextDocumentChanged = ({ uri, content }: TextDocumentChanged) => {
    if (this._windowFocused) {
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
        this._engine.updateVirtualFileContent(uri, changes[uri]);
      }
      this.events.dispatch(new DesignServerUpdated());
      this._updatingDocuments = false;
    }, UPDATE_THROTTLE);
  };

  private _onWindowFocused = () => {
    this._windowFocused = true;
  };

  private _onWindowBlurred = () => {
    this._windowFocused = false;
  };

  handleEvent = eventHandlers({
    [Initialized.TYPE]: this._start,
    [PCEngineInitialized.TYPE]: this._onEngineInitialized,
    [TextDocumentOpened.TYPE]: this._onTextDocumentOpened,
    [TextDocumentChanged.TYPE]: this._onTextDocumentChanged,
    [ActionType.WINDOW_FOCUSED]: this._onWindowFocused,
    [ActionType.WINDOW_BLURRED]: this._onWindowBlurred
  });
}
