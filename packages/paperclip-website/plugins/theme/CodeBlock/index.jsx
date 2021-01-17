import React, { useState, useEffect, useRef, useMemo } from "react";
// const { createComponentClass } = require("paperclip-mini-editor");
import CodeBlock from "@theme-init/CodeBlock";
import usePrismTheme from "@theme/hooks/usePrismTheme";

// const Editor = createComponentClass({ React, useState, useEffect, useRef });

export default (props) => {
  // const prismTheme = usePrismTheme();

  if (props.live) {
    return (
      <LiveEditor expanded={props.expanded !== "false"} height={props.height}>
        {props.children}
      </LiveEditor>
    );
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

let _playgroundPromise;

const loadPlayground = () => {
  return (
    _playgroundPromise ||
    (_playgroundPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "/browser.js";
      document.head.appendChild(script);
      script.onload = resolve;
    }))
  );
};

const LiveEditor = ({ children, height, expanded }) => {
  const mountRef = useRef();
  const graph = useMemo(() => extractContent(children), [children]);
  const [playgroundLoaded, setPlaygroundLoaded] = useState();

  useEffect(() => loadPlayground().then(() => setPlaygroundLoaded(true)), []);

  useEffect(() => {
    if (
      !mountRef.current ||
      typeof window === "undefined" ||
      !playgroundLoaded
    ) {
      return;
    }

    mountRef.current.appendChild(
      window["createPaperclipPlayground"]({
        compact: true,
        documents: graph,
        activeFrameIndex: expanded !== false ? 0 : undefined,
        height: height,
        slim: true,
      })
    );
  }, [playgroundLoaded, mountRef.current]);

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
