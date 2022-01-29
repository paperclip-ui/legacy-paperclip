// import { EngineDelegate } from "@paperclip-ui/core";
// import { PCMutation, PCSourceWriter } from "@paperclip-ui/source-writer";
// import {
//   isPaperclipFile,
//   engineDelegateChanged,
//   VirtNodeSource
// } from "@paperclip-ui/utils";
// import { Channels } from "@tandem-ui/designer/src/sagas/rpc/channels";
// import { FSItemKind } from "@tandem-ui/designer/src/state";
// import { REPLChannels } from "../channels";

// export class DesignerChannelHandler {
//   private _engine: EngineDelegate;
//   private _ready: Promise<void>;
//   private _resolveReady: () => void;
//   constructor(
//     private _channels: Channels,
//     private _replChannels: REPLChannels
//   ) {
//     // this._channels.getAllScreens.listen(this._getAllScreens);
//     // this._channels.hello.listen(this._hello);
//     // this._channels.openFile.listen(this._openFile);
//     // this._channels.loadDirectory.listen(this._loadDirectory);
//     // this._channels.editCode.listen(this._editCode);
//     // this._channels.editPCSource.listen(this._editPCSource);
//     // // this._channels.inspectNodeStyle.listen(this._inspectNodeStyles);
//     // this._channels.loadVirtualNodeSources.listen(this._loadVirtualNodeSources);
//     // this._ready = new Promise(resolve => (this._resolveReady = resolve));
//   }
//   init(engine: EngineDelegate) {
//     this._engine = engine;
//     this._engine.onEvent(event => {
//       this._channels.events.call(engineDelegateChanged(event));
//     });
//     this._resolveReady();
//   }
//   private _loadVirtualNodeSources = (sources: VirtNodeSource[]) => {
//     return sources.map(info => {
//       return {
//         virtualNodePath: info.path,
//         source: this._engine.getVirtualNodeSourceInfo(info.path, info.uri)
//       };
//     });
//   };

//   private _inspectNodeStyles = async (sources: VirtNodeSource[]) => {
//     return sources.map(source => [
//       source,
//       this._engine.inspectNodeStyles(source, 0)
//     ]);
//   };
//   private _editPCSource = async (mutations: PCMutation[]) => {
//     const writer = new PCSourceWriter(this._engine);
//     return writer.apply(mutations);
//   };
//   private _loadDirectory = async ({ path }) => {
//     // const files = await this._replChannels.getFiles.call(null);

//     return {
//       name: "/",
//       kind: FSItemKind.DIRECTORY,
//       absolutePath: "/",
//       url: "/",
//       children: Object.keys(files).map(filePath => {
//         return {
//           name: filePath.split("/").pop(),
//           absolutePath: filePath,
//           kind: FSItemKind.FILE,
//           url: filePath
//         };
//       })
//     };
//   };
//   private _editCode = ({ uri, value }) => {
//     this._engine.updateVirtualFileContent(uri, value);
//   };
//   private _openFile = async ({ uri }) => {
//     await this._ready;

//     if (isPaperclipFile(uri)) {
//       const data = this._engine.open(uri);
//       return {
//         uri,
//         data,
//         document: this._engine.getVirtualContent(uri)
//       };
//     }
//   };
//   private _getAllScreens = async () => {
//     await this._ready;
//     // const files = await this._replChannels.getFiles.call(null);
//     return this._engine.getAllLoadedData();
//   };
//   private _hello = async () => {
//     await this._ready;
//     // const canvasFile = await this._replChannels.getMainFile.call(null);
//     return {
//       canvasFile,
//       showFullEditor: true,
//       localResourceRoots: ["/"],
//       branchInfo: null
//     };
//   };
// }
