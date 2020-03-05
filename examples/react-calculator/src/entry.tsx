import React from "react";
import {App} from "./app";
import ReactDOM from "react-dom";
const mount = document.createElement("div");
const style = document.createElement("style");
style.textContent = `
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }
`;
mount.style.height = "100%";
document.body.appendChild(style);
document.body.appendChild(mount);
ReactDOM.render(<App />, mount);