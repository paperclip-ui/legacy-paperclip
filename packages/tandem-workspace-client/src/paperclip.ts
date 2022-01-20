import { RPCClientAdapter } from "@paperclip-ui/common";
import { VirtNodeSource } from "@paperclip-ui/utils";
import { inspectNodeStyleChannel } from "@tandem-ui/workspace-core";

export class PaperclipManager {
  private _inspectNodeStyle: ReturnType<typeof inspectNodeStyleChannel>;

  /**
   */

  constructor(client: RPCClientAdapter) {
    this._inspectNodeStyle = inspectNodeStyleChannel(client);
  }

  /**
   */

  async inspectNodeStyles(sources: VirtNodeSource[]) {
    return await this._inspectNodeStyle.call(sources);
  }
}
