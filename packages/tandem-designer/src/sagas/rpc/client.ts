import { sockAdapter } from "@paperclip-ui/common";
import SockJSClient from "sockjs-client";

export function connect(onMessage, onClient) {
  if (!/^http/.test(location.protocol)) {
    return;
  }
  const client = new SockJSClient(
    location.protocol + "//" + location.host + "/rt"
  );

  client.onopen = () => {
    onClient(sockAdapter(client));
  };

  client.onmessage = message => {
    const ev = JSON.parse(message.data);
    onMessage(ev);
  };

  return () => {
    client.close();
  };
}
