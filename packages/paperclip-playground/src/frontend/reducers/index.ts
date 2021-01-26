import {
  AppState,
  canEditFile,
  getNewFilePath,
  matchesLocationPath,
  APP_LOCATIONS
} from "../state";
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
import { historyReducer } from "paperclip-designer/src/reducers/history";
import { mapValues, result } from "lodash";
import mime from "mime-types";
import { stat } from "fs";
import { isPaperclipFile } from "paperclip-utils";

export const reducer = historyReducer(
  (state: AppState, action: Action) => {
    state = veReducer(state, action as VEAction) as AppState;

    switch (action.type) {
      case VEActionType.GLOBAL_Z_KEY_DOWN: {
        // undo may remove files
        if (!state.shared.documents[state.currentCodeFileUri]) {
          state = produce(state, newState => {
            const uri = getMainUri(state);
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
      case ActionType.LOGOUT_BUTTON_CLICKED: {
        return produce(state, newState => {
          newState.user = null;
        });
      }
      case ActionType.SESSION_REQUEST_STATE_CHANGED: {
        return produce(state, newState => {
          newState.user = action.payload.result;
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
              documents[uri] = editString(String(doc), changes[uri]);
            }
          })
        }) as AppState;

        return state;
      }
      case ActionType.PROJECT_FILES_LOAD_PROGRESS_CHANGED: {
        return produce(state, newState => {
          newState.progressLoadedPercent = action.payload;
        });
      }
      case ActionType.GET_PROJECT_REQUEST_CHANGED: {
        return produce(state, newState => {
          newState.currentProject = action.payload.result;
          if (!action.payload.result.data) {
            newState.shared.documents = {};
          }
        });
      }
      case ActionType.GET_PROJECTS_REQUEST_CHANGED: {
        return produce(state, newState => {
          newState.allProjects = action.payload.result;
        });
      }
      case ActionType.GET_PROJECT_FILES_REQUEST_CHANGED: {
        const result = action.payload.result;
        const mainFile =
          state.currentProject.data!.files.find(file => {
            return file.path == state.currentProject.data!.mainFileUri;
          }) || state.currentProject.data!.files[0];

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
      case ActionType.SHARE_PROJECT_REQUEST_STATE_CHANGED: {
        return produce(state, newState => {
          newState.shareProjectInfo = action.payload.result;
        })
      }
      case ActionType.SHARE_MODAL_CLOSED: {
        return produce(state, newState => {
          newState.shareProjectInfo = null;
        })
      }
      case ActionType.FILE_ITEM_CLICKED: {
        return produce(state, newState => {
          const previousUri = newState.currentCodeFileUri;
          newState.currentCodeFileUri = action.payload.uri;

          // media & svg files sync
          if (
            !isPaperclipFile(action.payload.uri) ||
            !isPaperclipFile(previousUri)
          ) {
            newState.designer.ui.query.currentFileUri = action.payload.uri;
          }
        });
      }
      case ActionType.REMOVE_FILE_CLICKED: {
        state = updateShared(state, {
          documents: produce(state.shared.documents, documents => {
            delete documents[action.payload.uri];
          })
        }) as AppState;

        const currentUri =
          state.currentCodeFileUri === action.payload.uri
            ? getMainUri(state)
            : state.currentCodeFileUri;

        state = maybeOpenUri(state, action.payload.uri, currentUri);
        return state;
      }
      case ActionType.RAW_FILE_UPLOADED: {
        const { data, path } = action.payload;
        return produce(state, newState => {
          newState.shared.documents[path] = data;
        });
      }

      case ActionType.FILES_DROPPED: {
        return produce(state, newState => {
          const files = Array.from(action.payload);
          for (const file of files) {
            const uri = getUniqueUri(
              file.name.replace(/\.\w+$/, ""),
              mime.extension(file.type) || "text/plain",
              newState.shared.documents
            );
            newState.shared.documents[uri] = file;

            // set dropped file as preview
            newState.currentCodeFileUri = uri;
            newState.designer.ui.query.currentFileUri = uri;
          }
        });
      }

      case ActionType.FILE_RENAMED: {
        const { newUri } = action.payload;
        state = produce(state, newState => {
          const content = newState.shared.documents[action.payload.uri];
          delete newState.shared.documents[action.payload.uri];
          newState.shared.documents[newUri] = content;
        });

        state = maybeOpenUri(state, action.payload.uri, newUri);

        return state;
      }
      case ActionType.NEW_FILE_NAME_ENTERED: {
        const { uri } = action.payload;

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
  },
  [ActionType.GET_PROJECT_REQUEST_CHANGED]
);

const maybeOpenUri = (state: AppState, checkUri: string, newUri: string) => {
  return produce(state, newState => {
    if (newState.currentCodeFileUri === checkUri) {
      newState.currentCodeFileUri = newUri;
    }

    if (newState.designer.ui.query.currentFileUri === checkUri) {
      newState.designer.ui.query.currentFileUri = newUri;
    }
  });
};

const getMainUri = (state: AppState) =>
  (state.currentCodeFileUri =
    state.currentProject?.data?.mainFileUri ||
    Object.keys(state.shared.documents)[0]);

const getUniqueUri = (
  name: string,
  ext: string,
  allFiles: Record<string, any>
) => {
  let i = 0;
  let path = `file:///${name}.${ext}`;
  while (1) {
    const pathExists = allFiles[path];
    if (!pathExists) {
      break;
    }

    path = `file:///${name}-${++i}.${ext}`;
  }

  return path;
};
