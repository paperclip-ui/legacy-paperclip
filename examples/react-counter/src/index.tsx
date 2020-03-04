import React from "react";
import ReactDOM from "react-dom";
import Counter from "./Counter";

const mount = document.createElement("div");
ReactDOM.render(<Counter />, mount);
document.body.appendChild(mount);
