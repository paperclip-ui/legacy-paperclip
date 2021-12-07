import { Dispatch } from "redux";
import { ImmutableStore } from "paperclip-common";
import { Action, ActionType, clientConnected } from "../..";
import { AppState } from "../../state";
import { Channels } from "./channels";
import { Connection } from "./connection";

export const rpcEngine = ({
  getState,
  dispatch
}: {
  getState: () => AppState;
  dispatch: Dispatch<Action>;
}) => {
  // const init = async () => {
  //   const projectId = getState().designer.ui.query.canvasFile;
  //   if (projectId) {
  //     const config = await channels.hello.call({projectId});
  //   }
  // };

  // const handleInit = (action: Action) => {
  //   switch(action.type) {
  //     case ActionType.LOCATION_CHANGED:
  //     case ActionType.CLIENT_CONNECTED: {
  //       return init();
  //     }
  //   }
  // }

  // const handleAction = (action: Action) => {
  //   handleInit(action);
  // };

  // const onOpen = () => {
  //   dispatch(clientConnected(null));
  // };

  // const connection = new Connection();
  // connection.onOpen(onOpen)
  // const channels = new Channels(connection);

  return next => action => {
    // handleAction(action);
    return next(action);
  };
};
