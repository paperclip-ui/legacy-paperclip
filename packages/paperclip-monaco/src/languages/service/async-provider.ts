import { IPaperclipEngineInfoProvider } from "./base";
import { SourceLocation } from "paperclip-utils";
import * as channels from "./channel";

export class PaperclipEngineAsyncInfoProvider
  implements IPaperclipEngineInfoProvider {
  private _worker: Worker;
  private _colorsChannel: ReturnType<typeof channels.documentColors>;
  private _updateDocument: ReturnType<typeof channels.updateDocument>;
  private _getSuggestions: ReturnType<typeof channels.getSuggestions>;

  constructor() {
    this._worker = new Worker(new URL("./worker.js", import.meta.url));
    this._colorsChannel = channels.documentColors(this._worker);
    this._updateDocument = channels.updateDocument(this._worker);
    this._getSuggestions = channels.getSuggestions(this._worker);
  }

  getDocumentColors(uri: string) {
    return this._colorsChannel.request({ uri });
  }
  updateDocument(uri: string, value: string) {
    this._updateDocument.request({ uri, value });
  }
  getSuggestions(text: string, uri: string) {
    return this._getSuggestions.request({ uri, text });
  }
}
