import { EngineDelegate, isPaperclipFile } from "paperclip";
import { Channels } from "tandem-designer/src/sagas/rpc/channels";

export class DesignerChannelHandler {
  private _engine: EngineDelegate;
  private _ready: Promise<void>;
  private _resolveReady: () => void;
  constructor(private _channels: Channels) {
    this._channels.getAllScreens.listen(this._getAllScreens);
    this._channels.hello.listen(this._hello);
    this._channels.openFile.listen(this._openFile);
    this._ready = new Promise(resolve => (this._resolveReady = resolve));
  }
  init(engine: EngineDelegate) {
    this._engine = engine;
    this._resolveReady();
  }
  private _openFile = async ({ uri }) => {
    await this._ready;
    console.log("OPEN");
    if (isPaperclipFile(uri)) {
      return {
        uri,
        data: this._engine.open(uri),
        document: this._engine.getVirtualContent(uri)
      };
    }
  };
  private _getAllScreens = async () => {
    await this._ready;
    return this._engine.getAllLoadedData();
  };
  private _hello = async () => {
    await this._ready;
    /*

  canvasFile?: string;
  showFullEditor?: boolean;
  localResourceRoots: string[];
  branchInfo: BranchInfo;
    */
    return {
      canvasFile: "entry.pc",
      showFullEditor: true,
      localResourceRoots: "/",
      branchInfo: null
    };
  };
}
