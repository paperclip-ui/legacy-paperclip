import { Store } from "../base";
import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { ImmutableStore, sockjsClientAdapter } from "@paperclip-ui/common";
import SockJSClient from "sockjs-client";
import { Kernel, WorkspaceEngineState } from "./core";
import { Dispatch } from "redux";
import { Action } from "../..";
import { manageLocalState } from "./local-state";
import { manageSideEffects } from "./side-effects";

export const workspaceEngine = (globalStore: Store) => {
  const localStore = new ImmutableStore<WorkspaceEngineState>({
    currentAppState: globalStore.getState(),
  });

  const client = new WorkspaceClient(
    sockjsClientAdapter(
      new SockJSClient(location.protocol + "//" + location.host + "/rt")
    )
  );

  const kernel: Kernel = {
    localStore,
    client,
    globalStore,
    dispatch: globalStore.dispatch as Dispatch<Action>,
  };

  manageSideEffects(kernel);

  return manageLocalState(kernel);
};
