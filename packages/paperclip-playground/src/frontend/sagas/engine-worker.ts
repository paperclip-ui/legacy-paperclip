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
  WorkerInitialized,
} from "../actions";
import { loadEngineDelegate } from "paperclip/browser";
import * as vea from "paperclip-visual-editor/src/actions";
import { AppState } from "../state";
import { applyPatch } from "fast-json-patch";
import { EngineDelegate } from "paperclip";
import { EngineDelegateEvent } from "paperclip";
import * as url from "url";
import {
  engineDelegateChanged,
  RedirectRequested,
} from "paperclip-visual-editor/src/actions";
import { PCSourceWriter } from "paperclip-source-writer";

const init = async () => {
  let _appState: AppState;
  let _engine: EngineDelegate;
  let _writer: PCSourceWriter;
  let _currentUri: string;

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
    _writer = new PCSourceWriter({
      engine: _engine,
      getContent: (uri) => _appState.documentContents[uri],
    });
    dispatch(engineLoaded(null));
    tryOpeningCurrentFile();
  };

  const tryOpeningCurrentFile = () => {
    if (
      _appState.ui.query.currentFileUri &&
      _engine &&
      (!_currentUri || _currentUri !== _appState.ui.query.currentFileUri)
    ) {
      _currentUri = _appState.ui.query.currentFileUri;
      _engine.open(_appState.ui.query.currentFileUri);
    }
  };

  const handleAppStateDiffed = async ({ payload: { ops } }: AppStateDiffed) => {
    _appState = applyPatch(_appState, ops, false, false).newDocument;
  };

  const handleCodeChange = (action: CodeEditorTextChanged) => {
    _engine.updateVirtualFileContent(
      _appState.currentCodeFileUri,
      action.payload
    );
  };

  const handleVirtObjectEdited = async (action: vea.PCVirtObjectEdited) => {
    dispatch(
      contentChangesCreated({
        changes: await _writer.getContentChanges(action.payload.mutations),
      })
    );
  };

  const handleContentChanges = ({
    payload: { changes },
  }: ContentChangesCreated) => {
    for (const uri in changes) {
      _engine.updateVirtualFileContent(uri, _appState.documentContents[uri]);
    }
  };

  const handleRedirect = (action: RedirectRequested) => {
    tryOpeningCurrentFile();
  };

  self.onmessage = ({ data: action }: MessageEvent) => {
    switch (action.type) {
      case ActionType.WORKER_INITIALIZED:
        return handleInitialized(action);
      case ActionType.APP_STATE_DIFFED:
        return handleAppStateDiffed(action);
      case ActionType.CODE_EDITOR_TEXT_CHANGED:
        return handleCodeChange(action);
      case vea.ActionType.REDIRECT_REQUESTED:
        return handleRedirect(action);
      case vea.ActionType.PC_VIRT_OBJECT_EDITED:
        return handleVirtObjectEdited(action);
      case ActionType.CONTENT_CHANGES_CREATED:
        return handleContentChanges(action);
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
          return url.resolve(fromPath, toPath);
        },
      },
    },
    onCrash
  );

  _engine.onEvent(onEngineEvent);
  onEngineInit();
};

init();
