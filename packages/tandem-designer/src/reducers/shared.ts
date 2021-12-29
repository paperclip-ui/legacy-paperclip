import { AppState, updateShared } from "../state";
import { produce } from "immer";
import { Action, ActionType, ExternalActionType } from "../actions";
import { editString } from "paperclip-source-writer/lib/string-editor";

export const sharedReducer = (state: AppState, action: Action) => {
  switch (action.type) {
    case ActionType.SOURCES_EDITED: {
      return updateShared(state, {
        documents: produce(state.shared.documents, documents => {
          for (const uri in action.payload) {
            documents[uri] = editString(
              String(documents[uri]),
              action.payload[uri]
            );
          }
        })
      });
    }
    case ActionType.CODE_CHANGED: {
      return updateShared(state, {
        documents: produce(state.shared.documents, documents => {
          documents[state.designer.currentCodeFile] = action.payload.value;
        })
      });
    }
    case ActionType.FILE_LOADED: {
      if (state.shared.documents[action.payload.uri]) {
        return state;
      }
      return updateShared(state, {
        documents: produce(state.shared.documents, documents => {
          documents[action.payload.uri] = action.payload.document;
        })
      });
    }
  }
  return state;
};
