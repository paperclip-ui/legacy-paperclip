import * as React from "react"
import * as ReactDOM from "react-dom";
import {Editor} from "./ui/main";

const mount = document.createElement("div");
document.body.appendChild(mount);

ReactDOM.render(<Editor />, mount);
