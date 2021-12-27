import React from "react";
import * as ReactDOM from "react-dom";
import { createMain } from "./components/Main";
import { HandleRPCOptions } from "./sagas/rpc";

export type InitOptions = {
  mount?: HTMLElement;
} & HandleRPCOptions;

export const init = ({
  mount = document.getElementById("div"),
  ...rest
}: InitOptions = {}) => {
  const Main = createMain(rest);
  ReactDOM.render(<Main />, mount);
};
