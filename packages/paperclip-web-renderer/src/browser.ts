import { Renderer } from "./renderer";

declare var vscode;

const thisScript = Array.from(document.querySelectorAll("script")).pop();

const parent = typeof vscode != "undefined" ? vscode : window;

const renderer = new Renderer(
  String(thisScript.src)
    .split(":")
    .shift() + ":"
);

renderer.onMetaClick(element => {
  parent.postMessage(
    {
      type: "metaElementClicked",
      sourceUri: element.sourceUri,
      sourceLocation: element.sourceLocation
    },
    location.origin
  );
});

// need in iframe to ensure that styles are isolated
const iframe = document.createElement("iframe");
Object.assign(iframe.style, {
  width: "100%",
  height: "100%",
  border: "none"
});

iframe.onload = () => {
  iframe.contentWindow.document.body.appendChild(renderer.mount);
};

document.body.appendChild(iframe);

const onMessage = ({ data: event }: MessageEvent) => {
  renderer.handleEngineEvent(JSON.parse(event));
};

window.onmessage = onMessage;
