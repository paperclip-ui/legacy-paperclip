import { eventChannel } from "redux-saga";
import { fork, put, select, take, takeEvery } from "redux-saga/effects";
import { loadEngineDelegate } from "paperclip/browser";
import { AppState } from "paperclip-visual-editor/src/state";
import { EngineDelegate } from "paperclip/src";
import * as path from "path";
import {
  engineCrashed,
  engineLoaded,
  Action,
  ActionType,
  CodeEditorTextChanged,
} from "../actions";
import {
  clientConnected,
  engineDelegateChanged,
  engineDelegateEventsHandled,
} from "paperclip-visual-editor/src/actions";

export function* handleEngine() {
  yield fork(startEngine);
  yield put(clientConnected(null));
}

function* startEngine() {
  let _state: AppState = yield select();
  let _engine: EngineDelegate;

  yield takeEvery([], function* () {
    _state = yield select();
  });

  const channel = eventChannel((emit) => {
    const onEngine = async (engine: EngineDelegate) => {
      _engine = engine;
      emit(engineLoaded(null));

      engine.onEvent((event) => {
        emit(engineDelegateChanged(event));
      });

      if (_state.ui.query.currentFileUri) {
        await _engine.open(_state.ui.query.currentFileUri);
      }
    };

    const onCrash = (error: Error) => {
      emit(engineCrashed(error));
    };

    loadEngineDelegate(
      {
        io: {
          readFile(uri) {
            return _state.documentContents[uri];
          },
          fileExists(uri: string) {
            return _state.documentContents[uri] != null;
          },
          resolveFile(fromPath: string, toPath: string) {
            return path.resolve(fromPath, toPath);
          },
        },
      },
      onCrash
    ).then(onEngine);

    return () => {};
  });

  yield takeEvery(ActionType.CODE_EDITOR_TEXT_CHANGED, function* (
    action: CodeEditorTextChanged
  ) {
    const state: AppState = yield select();
    _engine.updateVirtualFileContent(
      state.ui.query.currentFileUri,
      action.payload
    );
  });

  yield takeEvery(channel, function* (action: Action) {
    yield put(action);
  });
}
