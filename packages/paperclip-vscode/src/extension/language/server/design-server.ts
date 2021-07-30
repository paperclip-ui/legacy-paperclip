import { eventHandlers, Observable, Observer } from "paperclip-common";
import { Initialized } from "./connection";
import { startServer } from "paperclip-designer";
import * as URL from "url";

export class PaperclipDesignServer implements Observer {
  readonly events: Observable;
  constructor() {
    this.events = new Observable();
  }

  handleEvent = eventHandlers({
    [Initialized.TYPE]: this._start.bind(this)
  });

  async _start({ workspaceFolders }: Initialized) {
    console.log("RESOLVE");
    await startServer({
      localResourceRoots: workspaceFolders.map(({ uri }) => {
        return URL.fileURLToPath(uri);
      }),
      readonly: false,
      openInitial: false,
      handleEvent(event) {
        console.log("EV");
      }
    });
  }
}
