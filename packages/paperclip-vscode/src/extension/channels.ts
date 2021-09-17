import { remoteChannel } from "paperclip-common";

export const lockChangesChannel = remoteChannel<void, void>(
  "lockChangesChannel"
);
