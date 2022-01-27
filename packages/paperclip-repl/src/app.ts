import { Server as WorkspaceServer } from "@tandem-ui/workspace/lib/server";
import { ChannelHandler } from "./controllers/channel-handler";
import { REPLChannels } from "./controllers/channels";
import { DesignerController } from "./controllers/designer";
import { ParentController } from "./controllers/parent";

export type Options = {
  files: Record<string, string>;
  entry: string;
  activeFrame?: number;
  useLiteEditor?: boolean;
  floatingPreview?: boolean;
};

export class App {
  constructor(private _options: Options, private _mount: HTMLElement) {}
  init() {
    const workerParent = new ParentController(this._options);
    const channels = new REPLChannels(workerParent.getWorkerConnection());
    new ChannelHandler(channels, this._options);
    new DesignerController(workerParent, this._mount, this._options).init();
  }
}
