import {
  ActionType,
  locationChanged,
  LocationChanged
} from "paperclip-designer/src/actions";
import * as qs from "querystring";
import * as Url from "url";
import history from "paperclip-designer/src/dom-history";
import { call, fork, put, select, takeEvery } from "redux-saga/effects";
import * as api from "../api";
import {
  AppState,
  APP_LOCATIONS,
  getLocationParams,
  matchesLocationPath,
  Project,
  Result
} from "../state";
import { request } from "./utils";
import {
  getProjectFilesRequestChanged,
  getProjectRequestChanged,
  getProjectsRequestChanged
} from "../actions";
import { eventChannel } from "redux-saga";
import { result } from "lodash";

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
    [APP_LOCATIONS.PROJECTS]: function*() {
      yield request(getProjectsRequestChanged, function*() {
        return yield call(api.getProjects);
      });
    },
    [APP_LOCATIONS.PROJECT]: function*({ projectId }) {
      const project: Result<Project> = yield request(
        getProjectRequestChanged,
        function*() {
          return yield call(api.getProject, projectId);
        }
      );

      if (project.error) {
        return;
      }

      // TODO - to progress
      yield request(getProjectFilesRequestChanged, function*() {
        const allData = {};

        for (const { path, url } of project.data.files) {
          const resp = yield call(fetch, url, {
            credentials: "include"
          });
          allData[path] = yield call(() => resp.text());
        }

        return allData;
      });
    }
  });
}

type Routes = {
  [identifier: string]: (params: any) => Generator<any, any, any>;
};

function* route(routes: Routes) {
  yield takeEvery(ActionType.LOCATION_CHANGED, function*(
    action: LocationChanged
  ) {
    for (const test in routes) {
      if (matchesLocationPath(action.payload.pathname, test)) {
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
