import React, { useState, useEffect, useRef, useMemo } from "react";
const { createComponentClass } = require("paperclip-mini-editor");
import CodeBlock from "@theme-init/CodeBlock";
import usePrismTheme from "@theme/hooks/usePrismTheme";
import "paperclip-playground/dist/browser";

// const Editor = createComponentClass({ React, useState, useEffect, useRef });

const createPaperclipPlayground = window.createPaperclipPlayground;

export default (props) => {
  // const prismTheme = usePrismTheme();

  if (props.live) {
    return <LiveEditor>{props.children}</LiveEditor>;
  }
  // if (props.live) {
  //   const content = String(props.children);
  //   const files = content.split(/\/\/\s*file:\s*/g).filter(Boolean);
  //   const graph = {};

  //   let entry;

  //   for (const file of files) {
  //     const name = (file.match(/(.*?\.pc)/) || [, "main.pc"])[1];
  //     if (!entry) {
  //       entry = name;
  //     }

  //     const content = file.replace(name, "").trim();
  //     graph[name] = content;
  //   }

  //   return (
  //     <>
  //       <Editor
  //         graph={graph}
  //         previewStyle={{
  //           height: props.height
  //         }}
  //         defaultUri={entry}
  //         theme={prismTheme}
  //       />
  //     </>
  //   );
  // }

  return <CodeBlock {...props} />;
};

const LiveEditor = ({ children }) => {
  const mountRef = useRef();
  const graph = useMemo(() => extractContent(children), [children]);

  useEffect(() => {
    if (!mountRef.current) {
      return;
    }

    mountRef.current.appendChild(
      createPaperclipPlayground({
        compact: true,
        documents: graph,
        activeFrameInfex: 0,
        height: `700px`,
      })
    );
  }, [mountRef.current]);

  return <div ref={mountRef}></div>;
};

const extractContent = (text) => {
  const content = String(text);
  const files = content.split(/\/\/\s*file:\s*/g).filter(Boolean);
  const graph = {};

  let entry;

  for (const file of files) {
    const name = (file.match(/(.*?\.pc)/) || [, "main.pc"])[1];
    if (!entry) {
      entry = name;
    }

    const content = file.replace(name, "").trim();
    graph["file:///" + name] = content;
  }

  return graph;
};
