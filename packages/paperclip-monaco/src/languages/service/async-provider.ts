import { IPaperclipEngineInfoProvider } from "./base";
import * as channels from "./channel";
import { workerAdapter } from "paperclip-common";

export class PaperclipEngineAsyncInfoProvider
  implements IPaperclipEngineInfoProvider {
  private _worker: Worker;
  private _colorsChannel: ReturnType<typeof channels.documentColors>;
  private _updateDocument: ReturnType<typeof channels.updateDocument>;
  private _getSuggestions: ReturnType<typeof channels.getSuggestions>;

  constructor() {
    this._worker = new Worker(new URL("./worker.js", import.meta.url));
    this._colorsChannel = channels.documentColors(workerAdapter(this._worker));
    this._updateDocument = channels.updateDocument(workerAdapter(this._worker));
    this._getSuggestions = channels.getSuggestions(workerAdapter(this._worker));
  }

  getDocumentColors(uri: string) {
    return this._colorsChannel.call({ uri });
  }
  updateDocument(uri: string, value: string) {
    this._updateDocument.call({ uri, value });
  }
  getSuggestions(text: string, uri: string) {
    return this._getSuggestions.call({ uri, text });
  }
}
