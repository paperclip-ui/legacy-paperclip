import Mousetrap, { addKeycodes } from "mousetrap";
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
import {
  AppState,
  EmbeddedState,
  SyncLocationMode,
  UIStateQuery,
} from "../state";
import { handleCanvas } from "./canvas";
import { History } from "history";
import { omit } from "lodash";
import { HandleRPCOptions } from "./rpc";
import { handleKeyCommands } from "./hotkeys";
import { handleUI } from "./ui";

declare const DESIGNER_STATE: EmbeddedState | null;

export type AppStateSelector = (state) => AppState;

export type MainSagaOptions = {
  history: History;
} & HandleRPCOptions;

export function* mainSaga(
  mount: HTMLElement,
  getState: AppStateSelector,
  options: MainSagaOptions
) {
  yield fork(handleRenderer, getState);
  yield takeEvery(
    ActionType.CANVAS_MOUSE_DOWN,
    function* (action: CanvasMouseDown) {
      yield call(handleCanvasMouseDown, action, getState);
    }
  );

  // wait for client to be loaded to initialize anything so that
  // events properly get sent (like LOCATION_CHANGED)
  yield fork(handleKeyCommands, mount);
  yield fork(handleCanvas, getState);
  // yield fork(handleClipboard, getState);
  yield fork(handleLocationChanged, options.history, true);
  yield fork(handleLocation, getState, options.history);
  yield fork(handleActions, getState);
  yield fork(handleVirtualObjectSelected, getState);
  yield fork(handleUI);
  // yield fork(handleWorkspace);
  // yield fork(handleRPC, options);
}

function* handleRenderer(getState: AppStateSelector) {
  yield takeEvery(["FOCUS"], function () {
    window.focus();
  });
}

function* handleCanvasMouseDown(
  action: CanvasMouseDown,
  getState: AppStateSelector
) {
  yield fork(handleSyncFrameToLocation);

  const state: AppState = yield select();
}

function* handleSyncFrameToLocation() {
  const state: AppState = yield select();

  function* removeFrameFromQuery() {
    if (!state.designer.ui.query.frame) {
      return;
    }

    yield put(
      redirectRequest({ query: omit(state.designer.ui.query, ["frame"]) })
    );
  }

  if (state.designer.selectedNodePaths.length !== 1) {
    return yield call(removeFrameFromQuery);
  }

  const nodePath = state.designer.selectedNodePaths[0].split(".");

  if (nodePath.length !== 1) {
    return yield call(removeFrameFromQuery);
  }

  yield put(
    redirectRequest({
      query: {
        ...state.designer.ui.query,
        frame: nodePath[0],
      },
    })
  );
}

function* handleLocationChanged(history: History, initial?: boolean) {
  const parts = Url.parse(location.href, true);

  if (typeof DESIGNER_STATE !== "undefined" && initial) {
    return yield put(
      mainActions.locationChanged({
        protocol: parts.protocol,
        host: parts.host,
        pathname: history.location.pathname,
        query: DESIGNER_STATE,
      })
    );
  }

  yield put(
    mainActions.locationChanged({
      protocol: parts.protocol,
      host: parts.host,
      pathname: history.location.pathname,
      query: qs.parse(history.location.search.substring(1)),
    })
  );
}

function* handleLocation(getState: AppStateSelector, history: History) {
  const chan = eventChannel((emit) => {
    return history.listen(emit);
  });

  yield takeEvery(chan, function* () {
    yield call(handleLocationChanged, history);
  });
  yield takeEvery(ActionType.REDIRECT_REQUESTED, function* () {
    const state = yield select(getState);
    const pathname = history.location.pathname;
    const search =
      state.designer.syncLocationMode & SyncLocationMode.Query
        ? "?" + qs.stringify(state.designer.ui.query)
        : history.location.search;

    const newPath = pathname + search;

    if (newPath !== history.location.pathname + history.location.search) {
      history.push(newPath);
    }
  });
}

function* handleActions(getState: AppStateSelector) {
  while (1) {
    yield take();
    const state: AppState = yield select(getState);
    if (state.actions.length) {
      yield put(actionHandled(null));

      // need to clone to unfreeze
      yield put(JSON.parse(JSON.stringify(state.actions[0])));
    }
  }
}

function* handleVirtualObjectSelected(getState: AppStateSelector) {}

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
