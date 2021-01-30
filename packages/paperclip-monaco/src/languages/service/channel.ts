import { SourceLocation } from "paperclip-utils";
import { ColorInfo } from "./base";

export type Channel<TRequest, TResponse> = {
  request: (request: TRequest) => Promise<TResponse>;
  responder: (handle: (request: TRequest) => Promise<TResponse>) => void;
};

const spy = (obj, prop, handler) => {
  const oldProp = obj[prop];
  obj[prop] = (...args) => {
    oldProp && oldProp(...args);
    handler(...args);
  };

  return () => (obj[prop] = oldProp);
};

const spyOnce = (obj, prop, handler) => {
  const dispose = spy(obj, prop, (...args) => {
    dispose();
    handler(...args);
  });
};

const channel = <TRequest, TResponse = void>(name: string) => {
  return (worker: Worker | Window): Channel<TRequest, TResponse> => {
    const request = (payload: any): Promise<any> => {
      return new Promise(resolve => {
        const onMessage = event => {
          if (event.data.name === name) {
            disposeSpy();
            resolve(event.data.payload);
          }
        };

        const disposeSpy = spy(worker, "onmessage", onMessage);
        (worker as any).postMessage({ name, payload });
      });
    };

    const responder = (request: (payload: any) => Promise<any>) => {
      spy(worker, "onmessage", async event => {
        if (event.data.name === name) {
          (worker as any).postMessage({
            name,
            payload: await request(event.data.payload)
          });
        }
      });
    };

    return { request, responder };
  };
};

export const documentColors = channel<{ uri: string }, ColorInfo[]>(
  "documentColors"
);
export const updateDocument = channel<{ uri: string; value: string }>(
  "updateDocument"
);
