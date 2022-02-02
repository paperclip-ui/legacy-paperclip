import * as Url from "url";
import { fork, put, take, takeEvery, select, call } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import * as qs from "querystring";
import {
  ActionType,
  CanvasMouseDown,
  mainActions,
  actionHandled,
  redirectRequest,
  windowFocused,
  windowBlurred,
} from "../actions";
import { AppState, SyncLocationMode } from "../state";
import { handleCanvas } from "./canvas";
import { History } from "history";
import { omit } from "lodash";
import { HandleRPCOptions } from "./rpc";
import { handleKeyCommands } from "./hotkeys";
import { uiActions } from "../actions/ui-actions";

export type AppStateSelector = (state) => AppState;

export type MainSagaOptions = {
  history: History;
} & HandleRPCOptions;

export function* handleUI() {
  yield fork(handleAppFocus);
  yield fork(handleDocumentEvents);
  yield fork(handleDocumentMouseUp);
}

function* handleDocumentEvents() {
  yield fork(function* () {
    const chan = eventChannel((emit) => {
      document.addEventListener("wheel", emit, { passive: false });
      document.addEventListener("keydown", emit);
      return () => {
        document.removeEventListener("wheel", emit);
        document.removeEventListener("keydown", emit);
      };
    });

    yield takeEvery(chan, (event: any) => {
      if (event.type === "wheel" && event.metaKey) {
        event.preventDefault();
      }

      if (
        event.type === "keydown" &&
        (event.key === "=" || event.key === "-") &&
        event.metaKey
      ) {
        // event.preventDefault();
      }
    });
  });
}

function* handleAppFocus() {
  const chan = eventChannel((emit) => {
    document.addEventListener("mouseenter", (ev) => {
      if (ev.target === document) {
        emit(windowFocused(null));
      }
    });
    document.addEventListener("mouseleave", (ev) => {
      if (ev.target === document) {
        emit(windowBlurred(null));
      }
    });
    return () => {};
  });

  yield takeEvery(chan, function* (event: any) {
    yield put(event);
  });
}

function* handleDocumentMouseUp() {
  yield fork(function* () {
    const chan = eventChannel((emit) => {
      document.addEventListener("mouseup", emit, true);
      return () => {
        document.removeEventListener("mouseup", emit, true);
      };
    });

    yield takeEvery(chan, function* (event: any) {
      yield put(uiActions.documentMouseUp());
    });
  });
}
