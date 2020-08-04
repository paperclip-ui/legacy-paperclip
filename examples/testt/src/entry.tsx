import * as React from "react";
import * as ui from "./hello-paperclip.pc";
import * as ReactDOM from "react-dom";

const mount = document.createElement("div");
document.body.appendChild(mount);

ReactDOM.render(<ui.Message>Hello test-name</ui.Message>, mount);
