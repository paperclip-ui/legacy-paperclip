// import * as path from "path";
// import * as fs from "fs";

// import sockjs from "sockjs";
// import getPort from "get-port";
// import { createEngineDelegate, EngineDelegate } from "paperclip";
// import * as URL from "url";
// import {
//   dirLoaded,
//   ActionType,
//   FileOpened,
//   FSItemClicked,
//   Action,
//   ExternalAction,
//   pcFileLoaded,
//   instanceChanged,
//   InstanceAction,
//   crashed,
//   allPCContentLoaded,
//   initParamsDefined,
//   ExternalActionType,
//   ConfigChanged,
//   EnvOptionClicked,
//   browserstackBrowsersLoaded,
//   ServerAction,
//   TitleDoubleClicked,
//   VirtualNodesSelected,
//   virtualNodeSourcesLoaded,
//   MetaClicked,
//   revealExpressionSourceRequested,
//   StyleRuleFileNameClicked,
//   popoutWindowRequested
// } from "../actions";
// import {
//   AvailableBrowser,
//   EnvOption,
//   EnvOptionKind,
//   FSItemKind
// } from "../state";
// import express from "express";
// import { normalize } from "path";
// import { EventEmitter } from "events";
// import { noop } from "lodash";
// import { exec } from "child_process";
// import { EngineMode } from "paperclip";
// import { isPaperclipFile } from "paperclip";
// import * as ngrok from "ngrok";
// import * as qs from "querystring";
// import * as bs from "browserstack";
// import {
//   engineDelegateChanged,
//   NodeStyleInspection,
//   StyleRule,
//   VirtNodeSource
// } from "paperclip-utils";
// import { sourceWriterService } from "./services/source-writer";
// import { fileWatcherService } from "./services/file-watcher";
// import {
//   inspectNodeStyleChannel,
//   popoutWindowChannel,
//   revealNodeSourceChannel
// } from "../rpc/channels";
// import { sockAdapter } from "../../../paperclip-common";
// import { ServiceManager } from "./core/service-manager";

// type BrowserstackCredentials = {
//   username: string;
//   password: string;
// };

// export type ServerOptions = {
//   localResourceRoots: string[];
//   port?: number;
//   emit?: (action: Action) => void;
//   cwd?: string;
//   readonly?: boolean;
//   openInitial: boolean;
//   credentials?: {
//     browserstack?: BrowserstackCredentials;
//   };
// };

// export const startServer = async ({
//   port: defaultPort,
//   localResourceRoots,
//   emit: emitExternal = noop,
//   cwd = process.cwd(),
//   credentials = {},
//   openInitial,
//   readonly
// }: ServerOptions) => {
//   const engine = await createEngineDelegate(
//     {
//       mode: EngineMode.MultiFrame
//     },
//     () => {
//       emitExternal(crashed(null));
//     }
//   );

//   const services = [];

//   const port = await getPort({ port: defaultPort });

//   const io = sockjs.createServer();

//   const em = new EventEmitter();

//   const popoutWindow = (path: string) => {
//     let host = `http://localhost:${port}`;
//     let url = host + path;
//     exec(`open "${url}"`);
//   };

//   io.on("connection", conn => {
//     let targetUri;

//     handleChans(conn);

//     const emit = message => {
//       conn.write(JSON.stringify(message));
//     };

//     emit(initParamsDefined({ readonly, availableBrowsers: _browsers }));

//     const disposeEngineListener = engine.onEvent(event => {
//       emit(engineDelegateChanged(event));
//     });

//     const onExternalAction = emit;

//     em.on("externalAction", onExternalAction);

//     conn.on("data", data => {
//       const action: InstanceAction = JSON.parse(data) as any;

//       // pass action handling to plugins
//       for (const handleAction of services) {
//         handleAction(action);
//       }

//       emitExternal(instanceChanged({ targetPCFileUri: targetUri, action }));
//     });

//     const handleGetAllScreens = async () => {
//       emit(allPCContentLoaded(engine.getAllLoadedData()));
//     };

//     let _ngrokUrl;

//     /**
//      * @deprecated
//      */
//     const handleEnvOptionClicked = async ({
//       payload: { option, path }
//     }: EnvOptionClicked) => {
//       let host = `http://localhost:${port}`;

//       if (option.kind !== EnvOptionKind.Private) {
//         host = _ngrokUrl || (_ngrokUrl = await ngrok.connect(port));
//       }

//       let url = host + path;

//       if (option.kind === EnvOptionKind.Browserstack) {
//         url = getBrowserstackUrl(url, option);
//       }

//       exec(`open "${url}"`);
//     };

//     const getBrowserstackUrl = (url: string, option: EnvOption) => {
//       const launchOptions: AvailableBrowser = option.launchOptions;

//       const query = {
//         browser: launchOptions.browser,
//         browser_version: launchOptions.browserVersion,
//         scale_to_fit: true,
//         os: launchOptions.os,
//         os_version: launchOptions.osVersion,
//         start: true,
//         local: true,
//         url
//       };

//       return `https://live.browserstack.com/dashboard#${qs.stringify(query)}`;
//     };

//     const onFSItemClicked = async (action: FSItemClicked) => {
//       if (action.payload.kind === FSItemKind.DIRECTORY) {
//         loadDirectory(action.payload.absolutePath);
//       }
//     };

//     const onVirtualNodeSelected = (action: VirtualNodesSelected) => {
//       loadVirtualNodeSources(action.payload.sources);
//     };

//     const loadVirtualNodeSources = (virstSources: VirtNodeSource[]) => {
//       const sources = virstSources.map(info => {
//         return {
//           virtualNodePath: info.path,
//           source: engine.getVirtualNodeSourceInfo(info.path, info.uri)
//         };
//       });
//       emit(virtualNodeSourcesLoaded(sources));
//     };

//     const handleMetaClickVirtualNode = ({
//       payload: { nodeUri, nodePath }
//     }: MetaClicked) => {
//       const info = engine.getVirtualNodeSourceInfo(nodePath, nodeUri);
//       if (info) {
//         emitExternal(revealExpressionSourceRequested(info));
//       }
//     };

//     const handleOpen = (uri: string) => {
//       const data = openURI(uri);
//       const document =
//         engine.getVirtualContent(uri) ||
//         fs.readFileSync(new URL.URL(uri), "utf8");
//       emit(pcFileLoaded({ uri, document, data }));
//     };

//     const loadDirectory = (dirPath: string, isRoot = false) => {
//       fs.readdir(dirPath, (err, basenames) => {
//         if (err) {
//           return;
//         }

//         emit(
//           dirLoaded({
//             isRoot,
//             item: {
//               absolutePath: dirPath,
//               url: URL.pathToFileURL(dirPath).toString(),
//               kind: FSItemKind.DIRECTORY,
//               name: path.basename(dirPath),
//               children: basenames.map(basename => {
//                 const absolutePath = path.join(dirPath, basename);
//                 const isDir = fs.lstatSync(absolutePath).isDirectory();
//                 return {
//                   absolutePath,
//                   url: URL.pathToFileURL(absolutePath).toString(),
//                   name: basename,
//                   kind: isDir ? FSItemKind.DIRECTORY : FSItemKind.FILE,
//                   children: isDir ? [] : undefined
//                 };
//               })
//             }
//           })
//         );
//       });
//     };

//     // load initial since it has highest priority
//     if (localResourceRoots.length) {
//       loadDirectory(localResourceRoots[0], true);
//     }

//     conn.on("close", () => {
//       disposeEngineListener();
//       em.off("externalAction", onExternalAction);
//     });
//   });

//   const dispatch = (action: ExternalAction | ServerAction) => {
//     em.emit("externalAction", action);
//     if (action.type == ExternalActionType.CONFIG_CHANGED) {
//       handleConfigChanged(action);
//     }
//   };

//   let _bsClient;

//   const handleConfigChanged = ({ payload }: ConfigChanged) => {
//     maybeInitBrowserstack(payload.browserstackCredentials);
//   };

//   const maybeInitBrowserstack = (credentials: any) => {
//     if (!credentials || !credentials.username) {
//       return;
//     }
//     _bsClient = bs.createClient(credentials);
//     console.log("Getting all browserstack browsers");
//     _bsClient.getBrowsers((err, result) => {
//       if (err) {
//         return console.error(`can't load browsers: `, err);
//       }

//       const used = {};

//       _browsers = result
//         ?.map(browser => ({
//           ...browser,
//           osVersion: browser.os_version,
//           browserVersion: browser.browser_version
//         }))
//         .sort((a, b) => {
//           if (a.browser !== b.browser) {
//             return a.browser > b.browser ? 1 : -1;
//           } else if (a.browserVersion !== b.browserVersion) {
//             return a.browserVersion > b.browserVersion ? -1 : 1;
//           }
//         });

//       console.log("loaded %d browsers", _browsers.length);

//       dispatch(browserstackBrowsersLoaded(_browsers));
//     });
//   };

//   maybeInitBrowserstack(credentials?.browserstack);

//   console.info(`Listening on port %d`, port);

//   if (openInitial) {
//     exec(`open http://localhost:${port}/all`);
//   }

//   return {
//     port,
//     engine,
//     dispatch
//   };
// };
