import {
  astRequested,
  BasicPaperclipAction,
  BasicPaperclipActionType,
  previewContent,
  DependencyContent,
  loadedDataRequested,
  LoadedDataEmitted,
} from "@paperclip-ui/utils";
import { collectASTInfo } from "./ast-info";
import * as channels from "./channel";
import { getSuggestions } from "./autocomplete";
import { workerRPCClientAdapter } from "@paperclip-ui/common";

const init = () => {
  const channel = new BroadcastChannel("@paperclip-ui/core");
  const asts: Record<string, DependencyContent> = {};
  let _resolveAst: (content: any) => any = () => {};
  let _resolveLoadedData: (content: any) => any = () => {};

  const adapter = workerRPCClientAdapter(self);
  channels.documentColors(adapter).listen(async ({ uri }) => {
    return collectASTInfo(await waitForAST(uri)).colors;
  });
  channels.updateDocument(adapter).listen(async ({ uri, value }) => {
    channel.postMessage(previewContent({ uri, value }));
  });
  channels.getSuggestions(adapter).listen(async ({ uri, text }) => {
    const {
      payload: { data, imports, ast },
    } = await getLoadedData(uri);
    return getSuggestions(text, data, ast, imports);
  });

  const waitForAST = (uri: string): Promise<DependencyContent> => {
    if (asts[uri]) {
      return Promise.resolve(asts[uri]);
    } else {
      return new Promise((resolve) => {
        channel.postMessage(astRequested({ uri }));
        _resolveAst = resolve;
      });
    }
  };

  const getLoadedData = (uri: string): Promise<LoadedDataEmitted> => {
    return new Promise((resolve) => {
      channel.postMessage(loadedDataRequested({ uri }));
      _resolveLoadedData = resolve;
    });
  };

  const handleEngineAction = (action: BasicPaperclipAction) => {
    if (action.type === BasicPaperclipActionType.AST_EMITTED) {
      _resolveAst((asts[action.payload.uri] = action.payload.content));
    } else if (action.type === BasicPaperclipActionType.LOADED_DATA_EMITTED) {
      _resolveLoadedData(action);
    }
  };

  channel.onmessage = (event) => {
    handleEngineAction(event.data);
  };
};

init();
