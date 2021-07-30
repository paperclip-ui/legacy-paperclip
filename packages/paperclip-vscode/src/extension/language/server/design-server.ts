import { eventHandlers, Observable, Observer } from "paperclip-common";
import { Initialized } from "./connection";
import { startServer } from "paperclip-designer";
import { PCEngineInitialized } from "paperclip-designer/lib/server/services/pc-engine";
import * as URL from "url";

export class PaperclipDesignServer implements Observer {
  readonly events: Observable;
  constructor() {
    this.events = new Observable();
  }

  handleEvent = eventHandlers({
    [Initialized.TYPE]: this._start.bind(this),
    [PCEngineInitialized.TYPE]: this._onEngineInitialized.bind(this)
  });

  async _start({ workspaceFolders }: Initialized) {
    await startServer({
      localResourceRoots: workspaceFolders.map(({ uri }) => {
        return URL.fileURLToPath(uri);
      }),
      readonly: false,
      openInitial: false,
      handleEvent: event => {
        this.events.dispatch(event);
      }
    });
  }

  private _onEngineInitialized({ engine }: PCEngineInitialized) {}
}
