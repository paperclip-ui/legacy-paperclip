import { Disposable } from "../disposable";
import { RPCClientAdapter } from "./adapters";

export type Channel<TRequest, TResponse> = {
  call: (request: TRequest) => Promise<TResponse>;
  listen: (handle: (request: TRequest) => Promise<TResponse>) => Disposable;
};

export const remoteChannel = <TRequest, TResponse = void>(name: string) => {
  const requestName = `${name}:request`;
  const responseName = `${name}:response`;

  return (chan: RPCClientAdapter): Channel<TRequest, TResponse> => {
    const call = (payload: any): Promise<any> => {
      let id = Math.random();

      return new Promise((resolve, reject) => {
        const onMessage = message => {
          if (message.id === id) {
            disposeListener();
            if (message.error) {
              reject(message.error);
            } else {
              resolve(message.payload);
            }
          }
        };

        const disposeListener = chan.onMessage(onMessage);
        chan.send({ name: requestName, payload, id });
      });
    };

    const listen = (call: (payload: any) => Promise<any>) => {
      const dispose = chan.onMessage(async message => {
        if (message.name === requestName) {
          try {
            chan.send({
              name: responseName,
              id: message.id,
              payload: await call(message.payload)
            });
          } catch (error) {
            chan.send({
              name: responseName,
              id: message.id,
              error
            });
          }
        }
      });
      return { dispose };
    };

    return { call, listen };
  };
};
