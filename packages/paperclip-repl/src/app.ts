import { ChannelHandler } from "./controllers/channel-handler";
import { REPLChannels } from "./controllers/channels";
import { DesignerController } from "./controllers/designer";
import { ParentController } from "./controllers/parent";

export type Options = {
  files: Record<string, string>;
  entry: string;
};

export class App {
  constructor(private _options: Options) {}
  init() {
    const workerParent = new ParentController(this._options);
    const channels = new REPLChannels(workerParent.getWorkerConnection());
    new ChannelHandler(channels, this._options);
    new DesignerController(workerParent).init();
  }
}
