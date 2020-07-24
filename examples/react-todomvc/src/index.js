import React from "react";
import ReactDOM from "react-dom";
import App from "./app";
var mount = document.createElement("div");
ReactDOM.render(React.createElement(App, null), mount);
document.body.appendChild(mount);
