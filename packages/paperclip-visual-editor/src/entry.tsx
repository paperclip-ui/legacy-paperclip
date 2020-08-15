import React from "react";
import * as ReactDOM from "react-dom";
import { Editor } from "./components/Editor";

const mount = document.createElement("div");

ReactDOM.render(<Editor />, mount);

const iframe = document.createElement("iframe");
Object.assign(iframe.style, {
  width: "100%",
  height: "100%",
  border: "none"
});

// addresses https://github.com/crcn/paperclip/issues/310
iframe.srcdoc = `
  <!doctype html>
  <html>
    <head>
      <style>
        html, body {
          margin: 0;
          padding: 0;
        }
      </style>
    </head>
    <body>
    </body>
  </html>
`;

iframe.onload = () => {
  iframe.contentWindow.document.body.appendChild(mount);
};

document.body.appendChild(iframe);
