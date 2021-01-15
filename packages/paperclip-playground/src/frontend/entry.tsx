import React from "react";
import * as ReactDOM from "react-dom";
import { Main } from "./components/Main";

const mount = document.createElement("div");
Object.assign(mount.style, { width: "100%", height: "100%" });

ReactDOM.render(<Main />, mount);

document.body.appendChild(mount);
