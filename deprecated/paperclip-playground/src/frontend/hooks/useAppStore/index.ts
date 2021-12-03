import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Action } from "../../actions";
import { Dispatch } from "redux";
import { AppState } from "../../state";

export const useAppStore = (): {
  state: AppState;
  dispatch: Dispatch<Action>;
} => {
  const state = useSelector(identity);
  const dispatch = useDispatch();
  return useMemo(() => ({ state, dispatch }), [state, dispatch]);
};

const identity = (v: AppState) => v;
