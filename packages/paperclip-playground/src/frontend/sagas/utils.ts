import { call, put } from "redux-saga/effects";
import { BaseRequestChanged } from "../actions";
import { Result } from "../state";

export function* request<TData>(
  actionCreator: (payload: {
    result: Result<TData>;
  }) => BaseRequestChanged<any, TData>,
  load: () => Generator<any, TData, any> | Promise<TData>
) {
  yield put(actionCreator({ result: { done: false } }));
  try {
    const result = { data: yield call(load) };
    yield put(actionCreator({ result }));
    return result;
  } catch (error) {
    const result = { error };
    yield put(actionCreator({ result }));
    return result;
  }
}
