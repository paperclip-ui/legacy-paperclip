import { eventHandlers, Observable, Observer } from "paperclip-common";
import { Initialized, TextDocumentChanged, TextDocumentOpened } from "./events";
import { ActionType, startServer } from "paperclip-designer";
import { PCEngineInitialized } from "paperclip-designer/lib/server/services/pc-engine";
import * as URL from "url";
import { ExprSource } from "paperclip-utils";
import { RevealSourceRequested } from "./events";
import { EngineDelegate } from "paperclip";

export class PaperclipDesignServer implements Observer {
  readonly events: Observable;
  private _engine: EngineDelegate;
  private _windowFocused: boolean;

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
      console.log("SKIP FOC");
      return;
    }
    // TODO - check locks
    this._engine.updateVirtualFileContent(uri, content);
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
