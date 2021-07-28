import sockjs from "sockjs";
import { ServerEvent, ServerEventType, Dispatch } from "../events";

export const remoteChannelsService = (dispatch: Dispatch) => {
  const init = (connection: sockjs.Connection) => {
    console.log("INIT");
  };

  return {
    handleEvent(event: ServerEvent) {
      if (event.type === ServerEventType.REMOTE_CONNECTION) {
        init(event.connection);
      }
    }
  };
};
