import React, { useState, useEffect, useRef } from "react";
import * as ui from "./ui.pc";
import { createEngine, Engine } from "paperclip";
import SimpleEditor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import { Renderer } from "paperclip-web-renderer";

import "prismjs/components/prism-clike";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-javascript";
import "./prism.css";
import { render } from "react-dom";

const usePaperclipEngine = initialGraph => {
  const [engine, setEngine] = useState<Engine>(null);
  useEffect(() => {
    console.log("NEW");
    createEngine({
      io: {
        readFile(uri) {
          return initialGraph[uri];
        },
        resolveFile(from, to) {
          return to.replace("./", "");
        },
        fileExists(uri) {
          return Boolean(initialGraph[uri]);
        }
      }
    }).then(setEngine);
  }, [initialGraph]);
  return engine;
};

const initialGraph = {
  "entry.pc": `<import src="./module.pc" as="module"> <module.Message>hello</module.Message>`,
  "module.pc": `<div export component as="Message">{children}!</div>`
};

export const Editor = () => {
  const [currentGraph, setGraph] = useState(initialGraph);
  const [currentUri, setCurrentUri] = useState("entry.pc");

  const code = currentGraph[currentUri];

  const engine = usePaperclipEngine(initialGraph);

  const onCodeChange = code => {
    setGraph({
      ...currentGraph,
      [currentUri]: code
    });

    if (engine) {
      engine.updateVirtualFileContent(currentUri, code);
    }
  };

  return (
    <ui.Editor>
      <ui.CodePane
        tabs={
          <>
            {Object.keys(currentGraph).map(uri => {
              return (
                <ui.Tab
                  selected={uri === currentUri}
                  onClick={() => setCurrentUri(uri)}
                >
                  {uri}
                </ui.Tab>
              );
            })}
          </>
        }
      >
        <SimpleEditor
          value={code}
          style={{ width: "100%", height: "100%", overflow: "scroll" }}
          preClassName="language-html"
          onValueChange={onCodeChange}
          highlight={code => highlight(code, languages.html)}
        />
      </ui.CodePane>
      <Preview engine={engine} currentUri={currentUri} />
    </ui.Editor>
  );
};

type PreviewProps = {
  engine?: Engine;
  currentUri: string;
};

const Preview = ({ engine, currentUri }: PreviewProps) => {
  const [iframeBody, setIframeBody] = useState<HTMLElement>();
  let renderer: Renderer;

  useEffect(() => {
    if (!engine || !iframeBody) {
      return;
    }
    renderer = new Renderer("http://", currentUri);
    const disposeListener = engine.onEvent(renderer.handleEngineEvent);
    engine.run(currentUri).then(renderer.initialize);
    iframeBody.appendChild(renderer.mount);
    return () => {
      disposeListener();
      iframeBody.removeChild(renderer.mount);
    };
  }, [engine, currentUri, iframeBody]);

  const onLoad = event => {
    setIframeBody((event.target as HTMLIFrameElement).contentDocument.body);
  };

  return <ui.PreviewPane onIframeLoaded={onLoad} />;
};
