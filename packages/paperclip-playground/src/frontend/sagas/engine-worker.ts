import * as path from "path";
import {
  Action,
  ActionType,
  AppStateDiffed,
  CodeEditorTextChanged,
  ContentChangesCreated,
  contentChangesCreated,
  engineCrashed,
  engineLoaded,
  WorkerInitialized
} from "../actions";
import { loadEngineDelegate } from "paperclip/browser";
import * as vea from "paperclip-designer/src/actions";
import { AppState, WorkerState } from "../state";
import { applyPatch } from "fast-json-patch";
import { EngineDelegate } from "paperclip";
import { EngineDelegateEvent } from "paperclip";
import * as url from "url";
import {
  engineDelegateChanged,
  RedirectRequested
} from "paperclip-designer/src/actions";
import { PCSourceWriter } from "paperclip-source-writer";

const init = async () => {
  let _state: WorkerState;
  let _engine: EngineDelegate;
  let _writer: PCSourceWriter;
  let _currentUri: string;

  const dispatch = (action: Action) => {
    (self as any).postMessage(action);
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
      getContent: uri => _state.documents[uri]
    });
    dispatch(engineLoaded(null));
    tryOpeningCurrentFile();
  };

  const tryOpeningCurrentFile = () => {
    if (
      _state.currentFileUri &&
      _engine &&
      (!_currentUri || _currentUri !== _state.currentFileUri)
    ) {
      _currentUri = _state.currentFileUri;
      _engine.open(_state.currentFileUri);
    }
  };

  const handleAppStateDiffed = async ({ payload: { ops } }: AppStateDiffed) => {
    const oldState = _state;
    _state = applyPatch(_state, ops, false, false).newDocument;
    syncEngineDocuments(oldState);
  };

  const syncEngineDocuments = (oldState: WorkerState) => {
    if (_state.documents === oldState.documents) {
      return;
    }

    for (const uri in _state.documents) {
      const newContent = _state.documents[uri];
      const oldContent = oldState.documents[uri];
      if (newContent !== oldContent) {
        _engine.updateVirtualFileContent(uri, newContent);
      }
    }
  };

  // const handleCodeChange = (action: CodeEditorTextChanged) => {
  //   _engine.updateVirtualFileContent(
  //     _appState.currentCodeFileUri,
  //     action.payload
  //   );
  // };

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

  const handleProjectLoaded = () => {};

  const handleRedirect = (action: RedirectRequested) => {
    tryOpeningCurrentFile();
  };

  self.onmessage = ({ data: action }: MessageEvent) => {
    switch (action.type) {
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
