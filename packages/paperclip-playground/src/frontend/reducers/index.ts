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
import { mapValues } from "lodash";

export const reducer = (state: AppState, action: Action) => {
  state = veReducer(state, action as VEAction) as AppState;

  switch (action.type) {
    case ActionType.CODE_EDITOR_TEXT_CHANGED: {
      return {
        ...state,
        shared: {
          ...state.shared,
          documents: Automerge.change(state.shared.documents, documents => {
            for (const { text, rangeOffset, rangeLength } of action.payload) {
              // no replace operation by automerge, so need to do 2 things. I sure hope this scales 🤞

              let textDoc = documents[
                state.currentCodeFileUri
              ] as Automerge.Text;
              if (!textDoc) {
                documents[
                  state.currentCodeFileUri
                ] = textDoc = new Automerge.Text();
              }
              textDoc.deleteAt(rangeOffset, rangeLength);
              textDoc.insertAt(rangeOffset, ...text.split(""));
            }
          })
        }
      };
    }
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
        documents: Automerge.change(state.shared.documents, documents => {
          documents[state.currentCodeFileUri].splice(
            0,
            documents[state.currentCodeFileUri].length,
            action.payload
          );
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
    case ActionType.SAVE_BUTTON_CLICKED: {
      return produce(state, newState => {
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
        documents: Automerge.change(state.shared.documents, documents => {
          for (const uri in changes) {
            for (const { start, end, value } of changes[uri]) {
              documents[uri].deleteAt(start, end);
              documents[uri].insertAt(start, ...value.split(""));
            }
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
      const mainFile = state.currentProject.data!.mainFileUri
        ? state.currentProject.data!.files.find(file => {
            return file.path == state.currentProject.data!.mainFileUri;
          })
        : state.currentProject.data!.files[0];

      state = produce(state, newState => {
        const result = action.payload.result;

        if (result.data) {
          const contents = result.data!;
          newState.designer.ui.query.currentFileUri = mainFile.path;
          newState.shared.documents = Automerge.from(
            mapValues(
              contents,
              value => new Automerge.Text(null, value.split(""))
            )
          );
          newState.currentCodeFileUri = mainFile.path;

          // reset canvas zoom
          newState.designer.centeredInitial = false;
        }
      });

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
        documents: Automerge.change(state.shared.documents, documents => {
          documents[uri] = new Automerge.Text();
        })
      }) as AppState;

      return produce(state, newState => {
        newState.currentCodeFileUri = uri;
      });
    }
  }

  return state;
};
