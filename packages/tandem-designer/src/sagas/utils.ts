import { call, put, select, takeEvery } from "redux-saga/effects";
import {
  BaseRequestStateChanged,
  createDataResult,
  createErrorResult,
  createLoadingResult
} from "../actions/base";
import { Result } from "../state/result";

export function takeState(
  getState: (newState: any) => any,
  fn: any,
  actionFilter: any,
  args: any[] = []
) {
  let currentState;

  function* run() {
    const cstate = yield select(getState);

    if (cstate !== currentState) {
      yield call(fn, cstate, ...args);
    }

    currentState = cstate;
  }

  return call(function*() {
    yield call(run);
    yield takeEvery(actionFilter, run);
  });
}

export function* request<TData>(
  actionCreator: (payload: {
    result: Result<TData>;
  }) => BaseRequestStateChanged<any, TData>,
  load: () => Generator<any, TData, any> | Promise<TData>
) {
  yield put(actionCreator({ result: createLoadingResult() }));
  try {
    const result = createDataResult(yield call(load));
    yield put(actionCreator({ result }));
    return result;
  } catch (error) {
    const result = createErrorResult(error);
    yield put(actionCreator({ result }));
    return result;
  }
}
