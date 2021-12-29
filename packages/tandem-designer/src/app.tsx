import React from "react";
import * as ReactDOM from "react-dom";
import { createMain } from "./components/Main";
import { createBrowserHistory } from "history";
import { WithAppStoreOptions } from "./hocs";

export type InitOptions = {
  mount?: HTMLElement;
} & Partial<WithAppStoreOptions>;

export const init = ({
  mount = document.getElementById("app"),
  history = createBrowserHistory(),
  ...rest
}: InitOptions = {}) => {
  const Main = createMain({ history, ...rest });
  ReactDOM.render(<Main />, mount);
};
