import { AppState, getNewFilePath } from "../state";
import {
  Action as VEAction,
  ActionType as VEActionType
} from "paperclip-designer/src/actions";
import { Action, ActionType } from "../actions";
import produce from "immer";

import veReducer from "paperclip-designer/src/reducers/index";
import { editString } from "../utils/string-editor";
import Automerge from "automerge";
import { updateShared } from "paperclip-designer/src/state";
import { historyReducer } from "paperclip-designer/src/reducers/history"
import { mapValues, result } from "lodash";

export const reducer = historyReducer((state: AppState, action: Action) => {
  state = veReducer(state, action as VEAction) as AppState;

  switch (action.type) {
    // case ActionType.CODE_EDITOR_TEXT_CHANGED: {
    //   return {
    //     ...state,
    //     shared: {
    //       ...state.shared,
    //       documents: produce(state.shared.documents, documents => {
    //         for (const { text, rangeOffset, rangeLength } of action.payload) {
    //           // no replace operation by automerge, so need to do 2 things. I sure hope this scales 🤞

    //           const textDoc = documents[
    //             state.currentCodeFileUri
    //           ];

    //           documents[state.currentCodeFileUri] = textDoc.substr(0, rangeOffset) + text + textDoc.substr(rangeOffset, rangeLength);
    //         }
    //       })
    //     }
    //   };
    // }
    case VEActionType.GLOBAL_Z_KEY_DOWN: {
      // undo may remove files
      if (!state.shared.documents[state.currentCodeFileUri]) {
        state = produce(state, newState => {
          const uri = (newState.currentCodeFileUri =
            newState.currentProject?.data?.mainFileUri ||
            Object.keys(state.shared.documents)[0]);
          newState.designer.ui.query.currentFileUri = uri;
        });
      }

      return state;
    }
    case ActionType.SLIM_CODE_EDITOR_TEXT_CHANGED: {
      return updateShared(state, {
        documents: produce(state.shared.documents, documents => {
          documents[state.currentCodeFileUri] = action.payload;
        })
      });
    }
    case ActionType.ACCOUNT_CONNECTED: {
      return produce(state, newState => {
        newState.loadingUserSession = true;
      });
    }
    case ActionType.LOGOUT_BUTTON_CLICKED: {
      return produce(state, newState => {
        newState.user = null;
      });
    }
    case ActionType.SESSION_LOADED: {
      return produce(state, newState => {
        newState.user = action.payload;
        newState.loadingUserSession = false;
      });
    }
    case ActionType.SAVED_PROJECT: {
      return produce(state, newState => {
        newState.saving = action.payload;
      });
    }
    case VEActionType.GLOBAL_SAVE_KEY_DOWN:
    case ActionType.SAVE_BUTTON_CLICKED: {
      return produce(state, newState => {
        if (!state.user) {
          return;
        }
        newState.saving = { done: false };
      });
    }
    case ActionType.CONTENT_CHANGES_CREATED: {
      state = produce(state, newState => {
        // flag for saving
        newState.hasUnsavedChanges = true;
      });

      const changes = action.payload.changes;

      state = updateShared(state, {
        documents: produce(state.shared.documents, documents => {
          for (const uri in changes) {
            const doc = documents[uri];
            documents[uri] = editString(doc, changes[uri]);
          }
        })
      }) as AppState;

      return state;
    }
    case ActionType.GET_PROJECT_REQUEST_CHANGED: {
      return produce(state, newState => {
        newState.currentProject = action.payload.result;
      });
    }
    case ActionType.GET_PROJECT_FILES_REQUEST_CHANGED: {
      const result = action.payload.result;
      const mainFile = state.currentProject.data!.mainFileUri
        ? state.currentProject.data!.files.find(file => {
            return file.path == state.currentProject.data!.mainFileUri;
          })
        : state.currentProject.data!.files[0];

      state = produce(state, newState => {
        if (result.data) {
          const contents = result.data!;
          newState.designer.ui.query.currentFileUri = mainFile.path;
          newState.currentCodeFileUri = mainFile.path;

          // reset canvas zoom
          newState.designer.centeredInitial = false;
        }
      });

      if (result.data) {
        const contents = result.data!;
        state = updateShared(state, {
          documents: contents
        }) as AppState;
      }

      return state;
    }
    case VEActionType.LOCATION_CHANGED: {
      return produce(state, newState => {
        newState.playgroundUi = action.payload;
      });
    }
    case ActionType.FILE_ITEM_CLICKED: {
      return produce(state, newState => {
        newState.currentCodeFileUri = action.payload.uri;
      });
    }
    case ActionType.NEW_FILE_NAME_ENTERED: {
      const uri = getNewFilePath(action.payload.value);

      state = updateShared(state, {
        documents: produce(state.shared.documents, documents => {
          documents[uri] = "";
        })
      }) as AppState;

      return produce(state, newState => {
        newState.currentCodeFileUri = uri;
      });
    }
  }

  return state;
});
