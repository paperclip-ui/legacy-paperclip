import { Observable } from "paperclip-common";
import { PaperclipLanguageServerConnection } from "./connection";
import { PaperclipDesignServer } from "./design-server";

export class PaperclipLanguageServer {
  private _connection: PaperclipLanguageServerConnection;
  private _designServer: PaperclipDesignServer;
  private _events: Observable;

  constructor() {
    this._events = new Observable();
    this._connection = new PaperclipLanguageServerConnection({});
    this._events.source(this._connection.events);

    this._designServer = new PaperclipDesignServer();
    this._events.observe(this._designServer);
  }
  activate() {
    this._connection.activate();
  }
}

const server = new PaperclipLanguageServer();
server.activate();
