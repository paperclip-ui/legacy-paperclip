import React, { useState, useEffect } from "react";
import * as ui from "./ui.pc";
import { createEngine } from "paperclip";
import SimpleEditor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";

import "prismjs/components/prism-clike";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-javascript";
import "./prism.css";

export const Editor = () => {
  const [graph, setGraph] = useState({
    "entry.pc": `Hello World!`
  });

  const code = graph["entry.pc"];

  let engine;

  useEffect(() => {
    engine = createEngine({
      io: {
        readFile(uri) {
          return graph[uri];
        },
        resolveFile(from, to) {
          return to;
        },
        fileExists(uri) {
          return Boolean(graph[uri]);
        }
      }
    });
  });

  const onCodeChange = code => {
    setGraph({
      ...graph,
      "entry.pc": code
    });
  };

  return (
    <ui.Editor>
      <ui.CodePane
        tabs={
          <>
            <ui.Tab>Tab</ui.Tab>
            <ui.Tab selected>component.pc</ui.Tab>
          </>
        }
      >
        <SimpleEditor
          value={code}
          preClassName="language-html"
          onValueChange={onCodeChange}
          highlight={code => highlight(code, languages.html)}
        />
      </ui.CodePane>
      <ui.PreviewPane>PREVIEW</ui.PreviewPane>
    </ui.Editor>
  );
};
