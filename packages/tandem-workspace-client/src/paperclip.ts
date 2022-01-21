import { RPCClientAdapter } from "@paperclip-ui/common";
import { VirtNodeSource } from "@paperclip-ui/utils";
import {
  inspectNodeStyleChannel,
  revealNodeSourceByIdChannel,
  revealNodeSourceChannel,
} from "@tandem-ui/workspace-core";

export class PaperclipManager {
  private _inspectNodeStyle: ReturnType<typeof inspectNodeStyleChannel>;
  private _revealSource: ReturnType<typeof revealNodeSourceChannel>;
  private _revealBySourceId: ReturnType<typeof revealNodeSourceByIdChannel>;

  /**
   */

  constructor(client: RPCClientAdapter) {
    this._inspectNodeStyle = inspectNodeStyleChannel(client);
    this._revealSource = revealNodeSourceChannel(client);
    this._revealBySourceId = revealNodeSourceByIdChannel(client);
  }

  async revealNodeSource(source: VirtNodeSource) {
    await this._revealSource.call(source);
  }

  async revealNodeBySourceId(sourceId: string) {
    await this._revealBySourceId.call(sourceId);
  }

  /**
   */

  async inspectNodeStyles(sources: VirtNodeSource[]) {
    return await this._inspectNodeStyle.call(sources);
  }
}
