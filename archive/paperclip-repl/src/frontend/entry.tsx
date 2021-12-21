import React from "react";
import * as ReactDOM from "react-dom";
import { Main } from "./components/Main";
import { createAppStore } from "./hocs/withAppStore";

const createPlayground = (options: any = {}) => {
  const mount = document.createElement("div");

  const store = createAppStore(options, mount);

  mount.setAttribute(
    "style",
    `--designer-mode-height: ${options.height}; width: 100%`
  );

  ReactDOM.render(<Main store={store} />, mount);
  return mount;
};

window["createPaperclipPlayground"] = createPlayground;

// cheap check for embeddded doc 😅
// Better to have an explicit mount element
const mainMount = document.getElementById("paperclip-playground");
if (mainMount) {
  const mount = createPlayground();
  mainMount.appendChild(mount);
}
