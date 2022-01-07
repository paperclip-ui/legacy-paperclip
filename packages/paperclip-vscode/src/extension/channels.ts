import { remoteChannel } from "@paperclipui/common";

export const lockChangesChannel = remoteChannel<void, void>(
  "lockChangesChannel"
);
