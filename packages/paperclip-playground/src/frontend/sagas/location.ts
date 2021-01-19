import {
  ActionType,
  locationChanged,
  LocationChanged,
} from "paperclip-visual-editor/src/actions";
import * as qs from "querystring";
import * as Url from "url";
import history from "paperclip-visual-editor/src/dom-history";
import { call, fork, put, select, takeEvery } from "redux-saga/effects";
import * as api from "../api";
import {
  AppState,
  APP_LOCATIONS,
  getLocationParams,
  matchesLocationPath,
} from "../state";
import { request } from "./utils";
import {
  getProjectRequestChanged,
  getProjectsRequestChanged,
} from "../actions";
import { eventChannel } from "redux-saga";

export function* handleLocation() {
  yield fork(handleRoutes);
}

export function* handleRoutes() {
  yield call(route, {
    [APP_LOCATIONS.PROJECTS]: function* () {
      // yield request(getProjectsRequestChanged, function*() {
      //   return yield call(api.getProjects);
      // });
    },
    [APP_LOCATIONS.PROJECT]: function* ({ projectId }) {
      // const project = yield request(getProjectRequestChanged, function*() {
      //   return yield call(api.getProject, projectId);
      // });
    },
  });
}

type Routes = {
  [identifier: string]: (params: any) => Generator<any, any, any>;
};

function* route(routes: Routes) {
  yield takeEvery(ActionType.LOCATION_CHANGED, function* (
    action: LocationChanged
  ) {
    for (const test in routes) {
      if (matchesLocationPath(action.payload.pathname, test)) {
        const params = getLocationParams(
          action.payload.pathname,
          APP_LOCATIONS.PROJECTS
        );
        yield call(routes[test], params);
        break;
      }
    }
  });
}
