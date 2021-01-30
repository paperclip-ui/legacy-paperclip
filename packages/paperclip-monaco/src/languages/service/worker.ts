import { AstEmitted, astRequested, BasicPaperclipAction, BasicPaperclipActionType, previewContent, DependencyContent } from "paperclip-utils";
import { collectASTInfo } from "./ast-info";
import { ColorInfo } from "./base";
import * as channels from "./channel";


const init = () => {
  const channel = new BroadcastChannel("paperclip");
  const asts: Record<string, DependencyContent> = {};
  let _resolveAst: (content: any) => any = () => {};

  channels.documentColors(self).responder(async ({uri}) => {
    return collectASTInfo(await waitForAST(uri)).colors;
  });
  channels.updateDocument(self).responder(async ({uri, value}) => {
    channel.postMessage(previewContent({ uri, value }));
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

  const handleEngineAction = (action: BasicPaperclipAction) => {
    if (action.type === BasicPaperclipActionType.AST_EMITTED) {
      _resolveAst(asts[action.payload.uri] = action.payload.content);
    } else if (action.type === BasicPaperclipActionType.ENGINE_DELEGATE_CHANGED) {

    }
  }

  channel.onmessage = (event) => {
    handleEngineAction(event.data);
  }
};


init();