import React from "react";
import * as ReactDOM from "react-dom";
import { Main } from "./components/Main";
import { createAppStore } from "./hocs/withAppStore";

const createPlayground = (options: any = {}) => {
  const store = createAppStore(options);

  const mount = document.createElement("div");
  Object.assign(mount.style, {
    width: "100%",
    height: options.height || "100%",
  });

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
