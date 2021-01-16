import { eventChannel } from "redux-saga";
import { fork, put, select, take, takeEvery } from "redux-saga/effects";
import { loadEngineDelegate } from "paperclip/browser";
import { AppState } from "paperclip-visual-editor/src/state";
import { EngineDelegate } from "paperclip/src";
import * as path from "path";
import { engineCrashed, engineLoaded, Action } from "../actions";
import { engineDelegateChanged } from "paperclip-visual-editor/src/actions";

export function* handleEngine() {
  yield fork(startEngine);
}

function* startEngine() {
  let _state: AppState;
  let _engine: EngineDelegate;

  yield takeEvery([], function* () {
    _state = yield select();
  });

  const graph = {
    "/entry.pc": `Hello world`,
  };

  const channel = eventChannel((emit) => {
    const onEngine = async (engine: EngineDelegate) => {
      _engine = engine;
      emit(engineLoaded(null));

      engine.onEvent((event) => {
        emit(engineDelegateChanged(event));
      });
    };

    const onCrash = (error: Error) => {
      emit(engineCrashed(error));
    };

    loadEngineDelegate(
      {
        io: {
          readFile(uri) {
            return graph[uri];
          },
          fileExists(uri: string) {
            return graph[uri] != null;
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

  yield takeEvery(channel, function* (action: Action) {
    yield put(action);
  });
}
