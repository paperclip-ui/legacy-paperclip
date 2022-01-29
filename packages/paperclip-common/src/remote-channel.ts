// import { Disposable } from "./disposable";

// export type Channel<TRequest, TResponse> = {
//   call: (request: TRequest) => Promise<TResponse>;
//   listen: (handle: (request: TRequest) => Promise<TResponse>) => Disposable;
// };

// const spy = (obj, prop, handler) => {
//   const oldProp = obj[prop];

//   let spyFn;

//   // spy exists? Use that
//   if (oldProp?.callbacks) {
//     spyFn = oldProp;
//   } else {
//     const callbacks = [];
//     spyFn = (...args) => {
//       for (const cb of callbacks) {
//         cb && cb(...args);
//       }
//     };
//     spyFn.callbacks = callbacks;
//   }

//   spyFn.callbacks.push(handler);

//   obj[prop] = spyFn;

//   return () => {
//     if (spyFn.callbacks.length === 1) {
//       obj[prop] = spyFn[spyFn.callbacks[0]];
//     } else {
//       const i = spyFn.callbacks.indexOf(handler);
//       if (i !== -1) {
//         spyFn.callbacks.splice(i, 1);
//       }
//     }
//   };
// };

// type Message = {
//   name: string;
//   channelId: any;
//   id: any;
//   payload?: any;
//   error?: any;
// };

// type Adapter = {
//   onMessage: (listener: (message: Message) => void) => () => void;
//   send: (message: Message) => void;
// };

// export const workerRPCClientAdapter = (worker: Window | Worker): Adapter => ({
//   onMessage(listener) {
//     return spy(worker, "onmessage", event => listener(event.data));
//   },
//   send(message) {
//     (worker as any).postMessage(message);
//   }
// });

// // sockjs adapter
// export const sockjsClientAdapter = (worker: any): Adapter => ({
//   onMessage(listener) {
//     // is on the server
//     const onMessage = message => {
//       listener(JSON.parse(message));
//     };

//     // is on the client
//     if (!worker.on) {
//       return spy(worker, "onmessage", event => {
//         onMessage(event.data);
//       });
//     }

//     worker.on("data", onMessage);
//     return () => worker.off("data", onMessage);
//   },
//   send(message) {
//     ((worker as any).send || (worker as any).write).call(
//       worker,
//       JSON.stringify(message)
//     );
//   }
// });

// export const remoteChannel = <TRequest, TResponse = void>(name: string) => {
//   const requestName = `${name}:request`;
//   const responseName = `${name}:response`;

//   return (chan: Adapter): Channel<TRequest, TResponse> => {
//     const channelId = Math.random();

//     const call = (payload: any): Promise<any> => {
//       let id = Math.random();

//       return new Promise((resolve, reject) => {
//         const onMessage = message => {
//           if (message.id === id) {
//             disposeListener();
//             if (message.error) {
//               reject(message.error);
//             } else {
//               resolve(message.payload);
//             }
//           }
//         };
//         const disposeListener = chan.onMessage(onMessage);
//         chan.send({ name: requestName, payload, id, channelId });
//       });
//     };

//     const listen = (call: (payload: any) => Promise<any>) => {
//       const dispose = chan.onMessage(async message => {
//         if (message.name === requestName && message.channelId !== channelId) {
//           try {
//             chan.send({
//               name: responseName,
//               id: message.id,
//               channelId,
//               payload: await call(message.payload)
//             });
//           } catch (error) {
//             chan.send({
//               name: responseName,
//               id: message.id,
//               channelId,
//               error
//             });
//           }
//         }
//       });
//       return { dispose };
//     };

//     return { call, listen };
//   };
// };
