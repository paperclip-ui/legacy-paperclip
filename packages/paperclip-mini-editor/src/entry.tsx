import * as React from "react"
import * as ReactDOM from "react-dom";
import {Editor} from "./ui/main";

const mount = document.createElement("div");
document.body.appendChild(mount);

const files= [
  {
    name: "message.pc",
    content: [
      `<part id="message">`,
      `  Hello {children}!`,
      `</part>\n`,
      `<preview>`,
      `  <message>World</message>`,
      `</preview>`
    ].join("\n")
  }
]

ReactDOM.render(<Editor files={files} />, mount);
