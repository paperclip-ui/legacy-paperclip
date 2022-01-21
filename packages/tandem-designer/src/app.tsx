import React from "react";
import * as ReactDOM from "react-dom";
import { createMain } from "./components/Main";
import { createBrowserHistory } from "history";
import { CreateAppStoreOptions } from "./components/Main/create-app-store";

export type InitOptions = {
  mount?: HTMLElement;
} & Partial<CreateAppStoreOptions>;

export const init = ({
  mount = document.getElementById("app"),
  history = createBrowserHistory(),
  ...rest
}: InitOptions = {}) => {
  const Main = createMain({ history, ...rest });
  ReactDOM.render(<Main />, mount);
};
