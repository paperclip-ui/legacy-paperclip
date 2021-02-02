import {
  Action,
  ActionType,
  AppStateDiffed,
  contentChangesCreated,
  engineCrashed,
  engineLoaded,
  GetProjectFilesRequestChanged,
  WorkerInitialized
} from "../actions";
import { loadEngineDelegate } from "paperclip/browser";
import * as vea from "paperclip-designer/src/actions";
import {
  astEmitted,
  BasicPaperclipActionType,
  loadedDataEmitted
} from "paperclip-utils";
import { AppState, WorkerState } from "../state";
import { applyPatch } from "fast-json-patch";
import { EngineDelegate } from "paperclip";
import { EngineDelegateEvent } from "paperclip";
import * as url from "url";
import { RedirectRequested } from "paperclip-designer/src/actions";
import { PCSourceWriter } from "paperclip-source-writer";
import { isPaperclipFile, engineDelegateChanged } from "paperclip-utils";
import { emit } from "process";

const init = async () => {
  let _state: WorkerState;
  let _engine: EngineDelegate;
  let _writer: PCSourceWriter;
  let _currentUri: string;

  // open a line for any web workers that need access to the engine. Note that
  // this is _one way_ since whatever's controlling the engine worker needs to also control its state since
  // the engine worker handler may be the source of truth for that state.
  const channel = new BroadcastChannel("paperclip");

  const dispatch = (action: Action) => {
    channel.postMessage(action);
  };

  const onCrash = (e: Error) => {
    dispatch(engineCrashed(e));
  };

  const handleInitialized = ({ payload: { state } }: WorkerInitialized) => {
    _state = state;
    tryOpeningCurrentFile();
  };

  const onEngineEvent = (event: EngineDelegateEvent) => {
    dispatch(engineDelegateChanged(event));
  };

  const onEngineInit = () => {
    _writer = new PCSourceWriter({
      engine: _engine,
      getContent: uri => String(_state.documents[uri])
    });
    dispatch(engineLoaded(null));
    tryOpeningCurrentFile();
  };

  const tryOpeningCurrentFile = () => {
    if (
      _state.canvasFile &&
      _engine &&
      (!_currentUri || _currentUri !== _state.canvasFile)
    ) {
      _currentUri = _state.canvasFile;

      if (isPaperclipFile(_currentUri)) {
        _engine.open(_state.canvasFile);
      }
    }
  };

  const handleAppStateDiffed = async ({ payload: { ops } }: AppStateDiffed) => {
    const oldState = _state;
    _state = applyPatch(_state, ops, false, false).newDocument;
    syncEngineDocuments(oldState);
  };

  const syncEngineDocuments = (oldState: WorkerState) => {
    if (_state.documents === oldState.documents || !_engine) {
      return;
    }

    for (const uri in _state.documents) {
      if (!isPaperclipFile(uri)) {
        continue;
      }
      const newContent = _state.documents[uri];
      const oldContent = oldState.documents[uri];
      if (newContent !== oldContent && isPaperclipFile(uri)) {
        _engine.updateVirtualFileContent(uri, String(newContent));

        // necessary for editor extensions
        dispatch(astEmitted({ uri, content: _engine.getLoadedAst(uri) }));
      }
    }
  };

  const handleVirtObjectEdited = async (action: vea.PCVirtObjectEdited) => {
    dispatch(
      contentChangesCreated({
        changes: await _writer.getContentChanges(action.payload.mutations)
      })
    );
  };

  // const handleContentChanges = ({
  //   payload: { changes }
  // }: ContentChangesCreated) => {
  //   for (const uri in changes) {
  //     _engine.updateVirtualFileContent(uri, _state.documents[uri]);
  //   }
  // };

  const handleProjectLoaded = (action: GetProjectFilesRequestChanged) => {
    if (!action.payload.result.data || !_engine) {
      return;
    }
    _engine.purgeUnlinkedFiles();
  };

  const handleRedirect = (action: RedirectRequested) => {
    tryOpeningCurrentFile();
  };

  self.onmessage = ({ data: action }: MessageEvent) => {
    switch (action.type) {
      case ActionType.GET_PROJECT_FILES_REQUEST_CHANGED:
        return handleProjectLoaded(action);
      case ActionType.WORKER_INITIALIZED:
        return handleInitialized(action);
      case ActionType.APP_STATE_DIFFED:
        return handleAppStateDiffed(action);
      case vea.ActionType.REDIRECT_REQUESTED:
        return handleRedirect(action);
      case vea.ActionType.PC_VIRT_OBJECT_EDITED:
        return handleVirtObjectEdited(action);
    }
  };

  channel.onmessage = ({ data: action }: MessageEvent) => {
    switch (action.type) {
      case BasicPaperclipActionType.AST_REQUESTED: {
        return dispatch(
          astEmitted({
            uri: action.payload.uri,
            content: _engine.getLoadedAst(action.payload.uri)
          })
        );
      }
      case BasicPaperclipActionType.LOADED_DATA_REQUESTED: {
        return dispatch(
          loadedDataEmitted({
            uri: action.payload.uri,
            data: _engine.getLoadedData(action.payload.uri)
          })
        );
      }
      case BasicPaperclipActionType.PREVIEW_CONTENT: {
        return _engine.updateVirtualFileContent(
          action.payload.uri,
          action.payload.value
        );
      }
    }
  };

  _engine = await loadEngineDelegate(
    {
      io: {
        readFile(uri) {
          return _state.documents[uri];
        },
        fileExists(uri: string) {
          return _state.documents[uri] != null;
        },
        resolveFile(fromPath: string, toPath: string) {
          return url.resolve(fromPath, toPath);
        }
      }
    },
    onCrash
  );

  _engine.onEvent(onEngineEvent);
  onEngineInit();
};

init();