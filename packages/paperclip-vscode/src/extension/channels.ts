import { remoteChannel } from "@paperclip-ui/common";
import { ExprSource } from "@paperclip-ui/utils";

export type DesignServerStartedInfo = {
  httpPort: number;
  projectId: string;
};

export const designServerStartedChannel = remoteChannel<
  DesignServerStartedInfo,
  void
>("designServerStartedChannel");

export const revealSourceChannel = remoteChannel<ExprSource, void>(
  "revealSourceChannel"
);
