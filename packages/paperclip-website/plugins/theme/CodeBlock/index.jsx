import React, { useState, useEffect, useRef } from "react";
const { createComponentClass } = require("paperclip-mini-editor");
import CodeBlock from "@theme-init/CodeBlock";
import usePrismTheme from "@theme/hooks/usePrismTheme";

const Editor = createComponentClass({ React, useState, useEffect, useRef });

export default props => {
  const prismTheme = usePrismTheme();
  if (props.live) {
    const content = String(props.children);
    const files = content.split(/\/\/\s*file:\s*/g).filter(Boolean);
    const graph = {};

    let entry;

    for (const file of files) {
      const name = (file.match(/(.*?\.pc)/) || [, "main.pc"])[1];
      if (!entry) {
        entry = name;
      }

      const content = file.replace(name, "").trim();
      graph[name] = content;
    }

    return (
      <>
        <Editor graph={graph} defaultUri={entry} theme={prismTheme} />
      </>
    );
  }

  return <CodeBlock {...props} />;
};
