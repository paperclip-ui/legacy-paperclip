import { eventHandler } from "paperclip-common";
import { ServerKernel } from "../core/kernel";
import { HTTPServerStarted } from "./http-server";
import { exec } from "child_process";

type Options = {
  openInitial: boolean;
};

export const postInitService = ({ openInitial }: Options) => (
  kernel: ServerKernel
) => {
  kernel.events.observe({
    handleEvent: eventHandler(
      HTTPServerStarted.TYPE,
      ({ port }: HTTPServerStarted) => {
        if (openInitial) {
          exec(`open http://localhost:${port}/all`);
        }
      }
    )
  });
};
