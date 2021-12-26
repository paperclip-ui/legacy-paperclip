import { IConnection } from "tandem-designer/src/sagas/rpc/connection";
import { remoteChannel } from "paperclip-common";

const getFiles = remoteChannel<null, Record<string, string>>("getFiles");

export class Channels {
  readonly getFiles: ReturnType<typeof getFiles>;
  constructor(private _connection: IConnection) {
    this.getFiles = getFiles(this._connection);
  }
}
