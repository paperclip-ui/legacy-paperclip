import React, { useState, useEffect } from "react";
import { loadEngineDelegate } from "paperclip/browser";
// import "prism-material-themes/themes/material-palenight.css";
// import { highlight, languages } from "prismjs/components/prism-core";
// import "prismjs/components/prism-clike";
// import "prismjs/components/prism-css";
// import "prismjs/components/prism-markup";

import SimpleEditor from "react-simple-code-editor";

// import "prismjs/components/prism-clike";
// import "prismjs/components/prism-javascript";
import "./prism.css";

type SlimEditorProps = {
  value: string;
  onChange: (value: string) => void;
  theme?: any;
};
export const SlimEditor = ({ value, onChange, theme }: SlimEditorProps) => {
  const baseTheme = theme && typeof theme.plain === "object" ? theme.plain : {};
  return null;
  // return (
  //   <SimpleEditor
  //     value={value}
  //     style={{
  //       width: "100%",
  //       height: "100%",
  //       fontFamily:
  //         'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  //       fontSize: 15.2,
  //       letterSpacing: "0.06em",
  //       ...baseTheme
  //     }}
  //     preClassName="language-html"
  //     onValueChange={onChange}
  //     highlight={code => code
  //     }
  //   />
  // );
};
