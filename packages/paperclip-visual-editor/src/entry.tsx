import React from "react";
import * as ReactDOM from "react-dom";
import { Editor } from "./components/Editor";

const mount = document.createElement("div");
Object.assign(mount.style, { width: "100%", height: "100%" });

ReactDOM.render(<Editor />, mount);

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
