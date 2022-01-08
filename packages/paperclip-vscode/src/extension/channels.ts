import { remoteChannel } from "@paperclip-ui/common";

export const lockChangesChannel = remoteChannel<void, void>(
  "lockChangesChannel"
);
