import { IConnection } from "@tandem-ui/designer/src/sagas/rpc/connection";
import { remoteChannel } from "@paperclip-ui/common";

const getFiles = remoteChannel<null, Record<string, string>>("getFiles");
const getMainFile = remoteChannel<null, string>("getMainFile");

export class REPLChannels {
  // readonly getFiles: ReturnType<typeof getFiles>;
  // readonly getMainFile: ReturnType<typeof getMainFile>;
  constructor(private _connection: IConnection) {
    // this.getFiles = getFiles(this._connection);
    // this.getMainFile = getMainFile(this._connection);
  }
}
