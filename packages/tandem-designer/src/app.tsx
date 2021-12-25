import React from "react";
import * as ReactDOM from "react-dom";
import { createMain } from "./components/Main";
import { HandleRPCOptions } from "./sagas/rpc";

export type InitOptions = {
  mount?: HTMLElement;
} & HandleRPCOptions;

export const init = ({
  mount = document.createElement("div"),
  ...rest
}: InitOptions = {}) => {
  const Main = createMain(rest);
  Object.assign(mount.style, { width: "100%", height: "100%" });

  ReactDOM.render(<Main />, mount);

  Array.from(document.head.querySelectorAll("style")).forEach(style => {
    // Clear VS Code styles.
    if (/_vscodeApiScript|_defaultStyles/.test(String(style.id))) {
      style.remove();
    }
  });
  const defaultStyle = document.createElement("style");

  defaultStyle.textContent = `
    html, body {
      margin: 0;
      background: white;
    }
  `;

  document.head.appendChild(defaultStyle);
  document.body.appendChild(mount);
};
