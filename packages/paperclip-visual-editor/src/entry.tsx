import React from "React";
import ReactDOM from "react-dom";
import { Editor } from "./components/Editor";

const mount = document.createElement("div");

ReactDOM.render(<Editor />, mount);

document.body.appendChild(mount);
