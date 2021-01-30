import {
  AstEmitted,
  astRequested,
  BasicPaperclipAction,
  BasicPaperclipActionType,
  previewContent,
  DependencyContent,
  LoadedData,
  loadedDataRequested
} from "paperclip-utils";
import { collectASTInfo } from "./ast-info";
import * as channels from "./channel";
import { getSuggestions } from "./autocomplete";

const init = () => {
  const channel = new BroadcastChannel("paperclip");
  const asts: Record<string, DependencyContent> = {};
  let _resolveAst: (content: any) => any = () => {};
  let _resolveLoadedData: (content: any) => any = () => {};

  channels.documentColors(self).responder(async ({ uri }) => {
    return collectASTInfo(await waitForAST(uri)).colors;
  });
  channels.updateDocument(self).responder(async ({ uri, value }) => {
    channel.postMessage(previewContent({ uri, value }));
  });
  channels.getSuggestions(self).responder(async ({ uri, text}) => {
    return getSuggestions(text, await getLoadedData(uri));
  });

  const waitForAST = (uri: string): Promise<DependencyContent> => {
    if (asts[uri]) {
      return Promise.resolve(asts[uri]);
    } else {
      return new Promise(resolve => {
        channel.postMessage(astRequested({ uri }));
        _resolveAst = resolve;
      });
    }
  };

  const getLoadedData = (uri: string): Promise<LoadedData> => {
    return new Promise(resolve => {
      channel.postMessage(loadedDataRequested({ uri }));
      _resolveLoadedData = resolve;
    });
  };

  const handleEngineAction = (action: BasicPaperclipAction) => {
    if (action.type === BasicPaperclipActionType.AST_EMITTED) {
      _resolveAst((asts[action.payload.uri] = action.payload.content));
    } else if (
      action.type === BasicPaperclipActionType.LOADED_DATA_EMITTED
    ) {
      _resolveLoadedData(action.payload.data);
    }
  };

  channel.onmessage = event => {
    handleEngineAction(event.data);
  };
};

init();
