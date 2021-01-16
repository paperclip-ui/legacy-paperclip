import * as path from "path";
import {
  Action,
  ActionType,
  AppStateDiffed,
  CodeEditorTextChanged,
  engineCrashed,
  engineLoaded,
  WorkerInitialized,
} from "../actions";
import { loadEngineDelegate } from "paperclip/browser";
import * as vea from "paperclip-visual-editor/src/actions";
import { AppState } from "paperclip-visual-editor/src/state";
import { applyPatch } from "fast-json-patch";
import { EngineDelegate } from "paperclip";
import { EngineDelegateEvent } from "paperclip/src";
import { engineDelegateChanged } from "paperclip-visual-editor/src/actions";

const init = async () => {
  let _appState: AppState;
  let _engine: EngineDelegate;

  const dispatch = (action: Action) => {
    (self as any).postMessage(action);
  };

  const onCrash = (e: Error) => {
    dispatch(engineCrashed(e));
  };

  const handleInitialized = ({ payload: { appState } }: WorkerInitialized) => {
    _appState = appState;
    tryOpeningCurrentFile();
  };

  const onEngineEvent = (event: EngineDelegateEvent) => {
    dispatch(engineDelegateChanged(event));
  };

  const onEngineInit = () => {
    dispatch(engineLoaded(null));
    tryOpeningCurrentFile();
  };

  const tryOpeningCurrentFile = () => {
    if (_appState.ui.query.currentFileUri && _engine) {
      _engine.open(_appState.ui.query.currentFileUri);
    }
  };

  const handleAppStateDiffed = async ({ payload: { ops } }: AppStateDiffed) => {
    _appState = applyPatch(_appState, ops, false, false).newDocument;
  };

  const handleCodeChange = (action: CodeEditorTextChanged) => {
    _engine.updateVirtualFileContent(
      _appState.ui.query.currentFileUri,
      action.payload
    );
  };

  self.onmessage = ({ data: action }: MessageEvent) => {
    switch (action.type) {
      case ActionType.WORKER_INITIALIZED:
        return handleInitialized(action);
      case ActionType.APP_STATE_DIFFED:
        return handleAppStateDiffed(action);
      case ActionType.CODE_EDITOR_TEXT_CHANGED:
        return handleCodeChange(action);
    }
  };

  _engine = await loadEngineDelegate(
    {
      io: {
        readFile(uri) {
          return _appState.documentContents[uri];
        },
        fileExists(uri: string) {
          return _appState.documentContents[uri] != null;
        },
        resolveFile(fromPath: string, toPath: string) {
          return path.resolve(fromPath, toPath);
        },
      },
    },
    onCrash
  );

  _engine.onEvent(onEngineEvent);
  onEngineInit();
};

init();
