import React, { useState, useEffect, useRef } from "react";
const { createComponentClass } = require("paperclip-mini-editor");
import CodeBlock from "@theme-init/CodeBlock";

const Editor = createComponentClass({ React, useState, useEffect, useRef });

export default props => {
  if (props.live) {
    const content = String(props.children);
    const files = content.split(/\/\/\s*file:\s*/g).filter(Boolean);
    const graph = {};

    let entry;

    for (const file of files) {
      if (!file.match(/(.*?\.pc)/)) {
        console.log("ERR", file);
      }
      const name = (file.match(/(.*?\.pc)/) || [, "entry.pc"])[1];
      if (!entry) {
        entry = name;
      }

      const content = file.replace(name, "").trim();
      graph[name] = content;
    }

    console.log(graph);

    console.log(props.children);
    return (
      <>
        <Editor graph={graph} defaultUri={entry} />
      </>
    );
  }

  return <CodeBlock {...props} />;
};
