import React from "react";
import * as ReactDOM from "react-dom";
import { Main } from "./components/Main";

export type InitOptions = {
  mount?: HTMLElement;
};

export const init = ({
  mount = document.createElement("div")
}: InitOptions = {}) => {
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
