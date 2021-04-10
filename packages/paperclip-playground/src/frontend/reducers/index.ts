import {
  AppState,
  canEditFile,
  getNewFilePath,
  matchesLocationPath,
  cleanupPath,
  APP_LOCATIONS
} from "../state";
import {
  Action as VEAction,
  ActionType as VEActionType,
  redirectRequest
} from "paperclip-designer/src/actions";
import { Action, ActionType } from "../actions";
import produce from "immer";

import veReducer from "paperclip-designer/src/reducers/index";
import { editString } from "../utils/string-editor";
import Automerge from "automerge";
import { updateShared } from "paperclip-designer/src/state";
import { historyReducer } from "paperclip-designer/src/reducers/history";
import mime from "mime-types";
import { isPaperclipFile } from "paperclip-utils";

export const reducer = (state: AppState, action: Action) => {
  state = veReducer(state, action as VEAction) as AppState;

  switch (action.type) {
    case VEActionType.GLOBAL_Z_KEY_DOWN: {
      // undo may remove files
      if (!state.shared.documents[state.currentCodeFilePath]) {
        state = produce(state, newState => {
          const uri = getMainUri(state);

          newState.actions.push(
            redirectRequest({
              query: {
                canvasFile: uri
              }
            })
          );
        });
      }

      return state;
    }
    case ActionType.SLIM_CODE_EDITOR_TEXT_CHANGED: {
      return updateShared(state, {
        documents: produce(state.shared.documents, documents => {
          documents[state.currentCodeFilePath] = action.payload;
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
          return file.path == state.currentProject.data!.mainFilePath;
        }) || state.currentProject.data!.files[0];

      state = produce(state, newState => {
        newState.currentProjectFiles = action.payload.result;
        if (result.data) {
          if (!newState.designer.ui.query.canvasFile) {
            newState.actions.push(
              redirectRequest({
                query: {
                  canvasFile: mainFile.path
                }
              })
            );
          }

          newState.currentCodeFilePath = mainFile.path;

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
    case VEActionType.META_CLICKED: {
      return produce(state, newState => {
        newState.highlightLocation = action.payload.source.location;
        newState.currentCodeFilePath = action.payload.source.uri;
      });
    }
    case VEActionType.LOCATION_CHANGED: {
      return produce(state, newState => {
        newState.playgroundUi = action.payload;

        // new project
        if (matchesLocationPath(APP_LOCATIONS.ROOT, action.payload.pathname)) {
          newState.actions.push(
            redirectRequest({
              query: {
                canvasFile: newState.currentCodeFilePath
              }
            })
          );
        }
      });
    }
    case ActionType.SHARE_PROJECT_REQUEST_STATE_CHANGED: {
      return produce(state, newState => {
        newState.shareProjectInfo = action.payload.result;
      });
    }
    case ActionType.SHARE_MODAL_CLOSED: {
      return produce(state, newState => {
        newState.shareProjectInfo = null;
      });
    }
    case ActionType.FILE_ITEM_CLICKED: {
      return produce(state, newState => {
        const previousUri = newState.currentCodeFilePath;
        newState.currentCodeFilePath = action.payload.uri;

        // media & svg files sync
        if (
          !isPaperclipFile(action.payload.uri) ||
          !isPaperclipFile(previousUri)
        ) {
          newState.actions.push(
            redirectRequest({
              query: {
                canvasFile: action.payload.uri
              }
            })
          );
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
        state.currentCodeFilePath === action.payload.uri
          ? getMainUri(state)
          : state.currentCodeFilePath;

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
            mime.extension(String(mime.lookup(file.name)) || file.type) ||
              "text/plain",
            newState.shared.documents
          );

          console.log(file.type, file.type || String(mime.lookup(file.name)));

          newState.shared.documents[uri] = file;

          // set dropped file as preview
          newState.currentCodeFilePath = uri;

          newState.actions.push(
            redirectRequest({
              query: {
                canvasFile: uri
              }
            })
          );
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
        newState.currentCodeFilePath = uri;
      });
    }
  }

  return state;
};

const maybeOpenUri = (state: AppState, checkUri: string, newUri: string) => {
  return produce(state, newState => {
    if (newState.currentCodeFilePath === checkUri) {
      newState.currentCodeFilePath = newUri;
    }

    if (newState.designer.ui.query.canvasFile === checkUri) {
      newState.actions.push(
        redirectRequest({
          query: {
            canvasFile: newUri
          }
        })
      );
    }
  });
};

const getMainUri = (state: AppState) =>
  (state.currentCodeFilePath =
    state.currentProject?.data?.mainFilePath ||
    Object.keys(state.shared.documents)[0]);

const getUniqueUri = (
  name: string,
  ext: string,
  allFiles: Record<string, any>
): string => {
  let i = 0;
  let path = cleanupPath(`${name}.${ext}`);

  const existingPaths = Object.keys(allFiles).map(cleanupPath);

  while (1) {
    if (!existingPaths.includes(path)) {
      break;
    }

    path = cleanupPath(`${name}-${++i}.${ext}`);
  }

  return path;
};
