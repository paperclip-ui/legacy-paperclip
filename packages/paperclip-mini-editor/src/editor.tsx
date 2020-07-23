// import React, { useState, useEffect } from "react";
import * as ui from "./ui.pc";
import { createEngine, Engine } from "paperclip/browser";

import SimpleEditor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import { Renderer } from "paperclip-web-renderer";
import memoize from "fast-memoize";

import "prismjs/components/prism-clike";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-javascript";
import "./prism.css";
import { render } from "react-dom";

export const createComponentClass = ({
  React,
  useState,
  useEffect,
  useRef
}: any) => {
  const usePaperclipEngine = initialGraph => {
    const [engine, setEngine] = useState(null);
    useEffect(() => {
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
      }).then(v => {
        setEngine(v);
      });
    }, [initialGraph]);
    return engine;
  };

  const cachedGraph = memoize(graph => graph, {
    serializer: graph => JSON.stringify(graph)
  });

  const Editor = ({ graph, defaultUri }) => {
    const initialGraph = cachedGraph(graph);
    const [currentGraph, setGraph] = useState(initialGraph);
    const [currentUri, setCurrentUri] = useState(defaultUri);

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
            style={{ width: "100%", minHeight: "100%" }}
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
    const [iframeBody, setIframeBody] = useState();
    let renderer: Renderer;
    const iframeRef = useRef();

    useEffect(() => {
      if (!engine || !iframeBody) {
        return;
      }
      let disposeListener;
      renderer = new Renderer("http://", currentUri);

      const init = async () => {
        try {
          renderer.initialize(await engine.run(currentUri));
          disposeListener = engine.onEvent(renderer.handleEngineEvent);
        } catch (e) {
          console.warn(e);

          // wait for something to happen, then retry
          const dispose = engine.onEvent(event => {
            dispose();
            init();
          });
        }
      };

      init();

      iframeBody.appendChild(renderer.mount);
      return () => {
        if (disposeListener) {
          disposeListener();
        }
        iframeBody.removeChild(renderer.mount);
      };
    }, [engine, currentUri, iframeBody]);

    useEffect(() => {
      if (iframeBody) {
        return;
      }

      const timer = setInterval(() => {
        if (iframeRef.current?.contentDocument?.body) {
          setIframeBody(iframeRef.current.contentDocument.body);
        }
      }, 500);

      return () => {
        clearInterval(timer);
      };
    }, [iframeBody]);

    return <ui.PreviewPane iframeRef={iframeRef} />;
  };

  return Editor;
};
