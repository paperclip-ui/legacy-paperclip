import { Renderer } from "./renderer";

declare const vscode;
declare const TARGET_URI;
declare const PROTOCOL;

const LOADER_HTML = `
<style>
  @keyframes _80f4925f_lds-ellipsis1 
    { 0% { transform:scale(0); } 100% { transform:scale(1); } 
  } 
  
  @keyframes _80f4925f_lds-ellipsis3 { 0% { transform:scale(1); } 100% { transform:scale(0); } } 
  @keyframes _80f4925f_lds-ellipsis2 { 0% { transform:translate(0, 0); } 100% { transform:translate(24px, 0); } } 
  ._80f4925f_container { width:100vw; height:100vh; } 
  ._80f4925f_lds-ellipsis { display:inline-block; position:absolute; width:80px; height:80px; left:50%; top:50%; transform:translate(-50%, -50%) scale(0.7); } 
  ._80f4925f_lds-ellipsis div[data-pc-80f4925f] { position:absolute; top:33px; width:12px; height:13px; border-radius:50%; background:rgb(141, 141, 141); animation-timing-function:cubic-bezier(0, 1, 1, 0); } 
  ._80f4925f_lds-ellipsis div[data-pc-80f4925f]:nth-child(1) { left:8px; animation:_80f4925f_lds-ellipsis1 0.6s infinite; } 
  ._80f4925f_lds-ellipsis div[data-pc-80f4925f]:nth-child(2) { left:8px; animation:_80f4925f_lds-ellipsis2 0.6s infinite; } 
  ._80f4925f_lds-ellipsis div[data-pc-80f4925f]:nth-child(3) { left:32px; animation:_80f4925f_lds-ellipsis2 0.6s infinite; } 
  ._80f4925f_lds-ellipsis div[data-pc-80f4925f]:nth-child(4) { left:56px; animation:_80f4925f_lds-ellipsis3 0.6s infinite; }
</style>

<div class="_80f4925f_container container" data-pc-80f4925f>
   <div class="_80f4925f_lds-ellipsis lds-ellipsis" data-pc-80f4925f>
      <div data-pc-80f4925f></div>
      <div data-pc-80f4925f></div>
      <div data-pc-80f4925f></div>
      <div data-pc-80f4925f></div>
   </div>
</div>
`;

const parent = typeof vscode != "undefined" ? vscode : window;

const renderer = new Renderer(PROTOCOL, TARGET_URI);

renderer.onMetaClick(element => {
  parent.postMessage(
    {
      type: "metaElementClicked",
      source: element.source
    },
    location.origin
  );
});

renderer.onErrorBannerClick(error => {
  parent.postMessage(
    {
      type: "errorBannerClicked",
      error
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
  iframe.contentWindow.document.body.appendChild(renderer.mount);
};

const loaderDiv = document.createElement("div");
loaderDiv.innerHTML = LOADER_HTML;

document.body.appendChild(iframe);
document.body.appendChild(loaderDiv);

const onMessage = ({ data: { type, payload } }: MessageEvent) => {
  if (type === "ENGINE_EVENT") {
    renderer.handleEngineEvent(JSON.parse(payload));
  } else if (type === "INIT") {
    renderer.initialize(JSON.parse(payload));
    loaderDiv.remove();
  } else if (type === "ERROR") {
    renderer.handleError(JSON.parse(payload));
    loaderDiv.remove();
  }
};

window.onmessage = onMessage;

parent.postMessage({
  type: "ready"
});
