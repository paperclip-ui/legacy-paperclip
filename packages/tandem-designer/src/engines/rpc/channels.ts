import {
  commitChangesChannel,
  editCodeChannel,
  editPCSourceChannel,
  eventsChannel,
  getAllScreensChannel,
  helloChannel,
  inspectNodeStyleChannel,
  loadDirectoryChannel,
  loadVirtualNodeSourcesChannel,
  openFileChannel,
  popoutWindowChannel,
  revealNodeSourceByIdChannel,
  revealNodeSourceChannel
} from "../../rpc/channels";
import { Connection } from "./connection";

export class Channels {
  readonly hello: ReturnType<typeof helloChannel>;
  readonly inspectNodeStyle: ReturnType<typeof inspectNodeStyleChannel>;
  readonly revealNodeSource: ReturnType<typeof revealNodeSourceChannel>;
  readonly popoutWindow: ReturnType<typeof popoutWindowChannel>;
  readonly getAllScreens: ReturnType<typeof getAllScreensChannel>;
  readonly loadDirectory: ReturnType<typeof loadDirectoryChannel>;
  readonly openFile: ReturnType<typeof openFileChannel>;
  readonly commitChanges: ReturnType<typeof commitChangesChannel>;
  readonly loadVirtualNdoeSources: ReturnType<
    typeof loadVirtualNodeSourcesChannel
  >;
  readonly revealNodeSourceById: ReturnType<typeof revealNodeSourceByIdChannel>;
  readonly editPCSource: ReturnType<typeof editPCSourceChannel>;
  readonly events: ReturnType<typeof eventsChannel>;
  readonly editCode: ReturnType<typeof editCodeChannel>;

  constructor(connection: Connection) {
    this.hello = helloChannel(connection);
    this.inspectNodeStyle = inspectNodeStyleChannel(connection);
    this.revealNodeSource = revealNodeSourceChannel(connection);
    this.popoutWindow = popoutWindowChannel(connection);
    this.getAllScreens = getAllScreensChannel(connection);
    this.loadDirectory = loadDirectoryChannel(connection);
    this.commitChanges = commitChangesChannel(connection);
    this.openFile = openFileChannel(connection);
    this.loadVirtualNdoeSources = loadVirtualNodeSourcesChannel(connection);
    this.revealNodeSourceById = revealNodeSourceByIdChannel(connection);
    this.editPCSource = editPCSourceChannel(connection);
    this.events = eventsChannel(connection);
    this.editCode = editCodeChannel(connection);
  }
}
