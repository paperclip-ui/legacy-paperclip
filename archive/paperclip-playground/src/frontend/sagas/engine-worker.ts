import {
  Action,
  ActionType,
  AppStateDiffed,
  contentChangesCreated,
  engineCrashed,
  engineLoaded,
  WorkerInitialized
} from "../actions";
import { loadEngineDelegate } from "@paperclip-ui/core/browser";
import * as vea from "@tandem-ui/designer/src/actions";
import {
  astEmitted,
  BasicPaperclipActionType,
  EvaluatedDataKind,
  LoadedData,
  loadedDataEmitted
} from "@paperclip-ui/utils";
import { WorkerState } from "../state";
import { applyPatch } from "fast-json-patch";
import { EngineDelegate } from "@paperclip-ui/core";
import { EngineDelegateEvent } from "@paperclip-ui/core";
import * as url from "url";
import { RedirectRequested } from "@tandem-ui/designer/src/actions";
import { PCSourceWriter } from "@paperclip-ui/source-writer";
import { isPaperclipFile, engineDelegateChanged } from "@paperclip-ui/utils";

const init = async () => {
  let _state: WorkerState;
  let _engine: EngineDelegate;
  let _writer: PCSourceWriter;
  let _currentUri: string;
  let _resolveEngine: (engine: EngineDelegate) => void;
  let _enginePromise = new Promise<EngineDelegate>(resolve => {
    _resolveEngine = resolve;
  });

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
    _writer = new PCSourceWriter(_engine);
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

  const syncEngineDocuments = async (oldState: WorkerState) => {
    if (_state.documents === oldState.documents || !_engine) {
      return;
    }

    if (oldState.currentProjectId !== _state.currentProjectId) {
      _engine.reset();
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
        dispatch(
          astEmitted({ uri, content: (await _enginePromise).getLoadedAst(uri) })
        );
      }
    }
  };

  const handleVirtObjectEdited = async (action: vea.PCVirtObjectEdited) => {
    dispatch(
      contentChangesCreated({
        changes: _writer.apply(action.payload.mutations)
      })
    );
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
      case vea.ActionType.REDIRECT_REQUESTED:
        return handleRedirect(action);
      case vea.ActionType.PC_VIRT_OBJECT_EDITED:
        return handleVirtObjectEdited(action);
    }
  };

  channel.onmessage = async ({ data: action }: MessageEvent) => {
    switch (action.type) {
      case BasicPaperclipActionType.AST_REQUESTED: {
        return dispatch(
          astEmitted({
            uri: action.payload.uri,
            content: (await _enginePromise).getLoadedAst(action.payload.uri)
          })
        );
      }
      case BasicPaperclipActionType.LOADED_DATA_REQUESTED: {
        const data = (await _enginePromise).getLoadedData(action.payload.uri);
        const ast = (await _enginePromise).getLoadedAst(action.payload.uri);

        const imports: Record<string, LoadedData> = {};

        if (data?.kind === EvaluatedDataKind.PC) {
          for (const rel in data.dependencies) {
            imports[rel] = (await _enginePromise).getLoadedData(
              data.dependencies[rel]
            );
          }
        }

        return dispatch(
          loadedDataEmitted({
            uri: action.payload.uri,
            data,
            imports,
            ast
          })
        );
      }
      case BasicPaperclipActionType.PREVIEW_CONTENT: {
        return (await _enginePromise).updateVirtualFileContent(
          action.payload.uri,
          action.payload.value
        );
      }
    }
  };

  _resolveEngine(
    (_engine = await loadEngineDelegate(
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
    ))
  );

  _engine.onEvent(onEngineEvent);
  onEngineInit();
};

init();
