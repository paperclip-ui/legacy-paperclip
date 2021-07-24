export type Channel<TRequest, TResponse> = {
  call: (request: TRequest) => Promise<TResponse>;
  listen: (handle: (request: TRequest) => Promise<TResponse>) => void;
};

const spy = (obj, prop, handler) => {
  const oldProp = obj[prop];
  obj[prop] = (...args) => {
    oldProp && oldProp(...args);
    handler(...args);
  };

  return () => (obj[prop] = oldProp);
};

type Message = {
  name: string;
  payload: any;
};

type Adapter = {
  onMessage: (listener: (message: Message) => void) => () => void;
  send: (message: Message) => void;
};

export const workerAdapter = (worker: Window | Worker): Adapter => ({
  onMessage(listener) {
    return spy(worker, "onmessage", event => listener(event.data));
  },
  send(message) {
    (worker as any).postMessage(message);
  }
});

// sockjs adapter
export const sockAdapter = (worker: any): Adapter => ({
  onMessage(listener) {
    // is on the server
    const onMessage = message => {
      listener(JSON.parse(message));
    };

    // is on the client
    if (!worker.on) {
      return spy(worker, "onmessage", event => {
        onMessage(event.data);
      });
    }

    worker.on("data", onMessage);
    return () => worker.off("data", onMessage);
  },
  send(message) {
    ((worker as any).send || (worker as any).write).call(
      worker,
      JSON.stringify(message)
    );
  }
});

export const remoteChannel = <TRequest, TResponse = void>(name: string) => {
  return (chan: Adapter): Channel<TRequest, TResponse> => {
    const call = (payload: any): Promise<any> => {
      return new Promise(resolve => {
        const onMessage = message => {
          if (message.name === name) {
            disposeListener();
            resolve(message.payload);
          }
        };

        const disposeListener = chan.onMessage(onMessage);
        chan.send({ name, payload });
      });
    };

    const listen = (call: (payload: any) => Promise<any>) => {
      chan.onMessage(async message => {
        if (message.name === name) {
          chan.send({
            name,
            payload: await call(message.payload)
          });
        }
      });
    };

    return { call, listen };
  };
};
