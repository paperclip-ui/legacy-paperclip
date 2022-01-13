import * as sockjs from "sockjs";
import { InternalHost } from "./internal-host";

export class Connection {
  /**
   */

  constructor(
    private _connection: sockjs.Connection,
    private _host: InternalHost
  ) {}
}
