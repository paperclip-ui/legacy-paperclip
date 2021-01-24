import React from "react";
import { Dispatch } from "redux";
import { AppState } from "../state";
import { Action } from "../actions";

export const AppStoreContext = React.createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
}>(null);
