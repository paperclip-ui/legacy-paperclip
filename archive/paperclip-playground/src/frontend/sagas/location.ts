import {
  ActionType as VEActionType,
  locationChanged,
  LocationChanged
} from "@tandemui/designer/src/actions";
import { ActionType, Action } from "../actions";
import * as qs from "querystring";
import * as Url from "url";
import history from "@tandemui/designer/src/dom-history";
import {
  call,
  fork,
  put,
  select,
  take,
  takeEvery,
  takeLatest
} from "redux-saga/effects";
import * as api from "../api";
import {
  AppState,
  APP_LOCATIONS,
  getLocationParams,
  matchesLocationPath,
  Project,
  EDITABLE_MIME_TYPES,
  Result,
  canEditFile
} from "../state";
import { loadProject, request } from "./utils";
import {
  getProjectFilesRequestChanged,
  getProjectRequestChanged,
  getProjectsRequestChanged
} from "../actions";
import { eventChannel } from "redux-saga";
import { delay, result } from "lodash";

export function* handleLocation() {
  yield fork(handleRoutes);
}

export function* handleRoutes() {
  // todo - require auth
  yield call(route, {
    [APP_LOCATIONS.PROJECTS]: function*() {
      // yield request(getProjectsRequestChanged, function*() {
      //   return yield call(api.getProjects);
      // });
    },
    [APP_LOCATIONS.PROJECTS]: requireAuth(function*() {
      yield request(getProjectsRequestChanged, function*() {
        return yield call(api.getProjects);
      });
    }),
    [APP_LOCATIONS.PROJECT]: requireAuth(function*({ projectId }) {
      yield call(loadProject, projectId);
    }),
    [APP_LOCATIONS.SHARED_PROJECT]: function*({ projectHash }) {
      yield call(loadProject, projectHash);
    }
  });
}

function requireAuth(fn) {
  return function*(params) {
    let state: AppState = yield select();
    if (!state.user || !state.user.done) {
      while (1) {
        const action = yield take(ActionType.SESSION_REQUEST_STATE_CHANGED);
        if (action.payload.result.done) {
          break;
        }
      }
      state = yield select();
    }

    if (!state.user.data) {
      return history.push("/");
    }
    yield call(fn, params);
  };
}

type Routes = {
  [identifier: string]: (params: any) => Generator<any, any, any>;
};

function* route(routes: Routes) {
  let _currentState: AppState;

  yield takeEvery(VEActionType.LOCATION_CHANGED, function*(
    action: LocationChanged
  ) {
    for (const test in routes) {
      if (matchesLocationPath(action.payload.pathname, test)) {
        const _previousState = _currentState;
        _currentState = yield select();

        // Skip if just changing query
        if (
          _previousState?.playgroundUi?.pathname === action.payload.pathname
        ) {
          break;
        }

        const params = getLocationParams(action.payload.pathname, test);
        try {
          yield call(routes[test], params);
        } catch (e) {
          console.error(e);
        }
        break;
      }
    }
  });
}
