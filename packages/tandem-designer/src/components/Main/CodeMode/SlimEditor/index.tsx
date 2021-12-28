import React, { useEffect, useRef, useState } from "react";
// import "prism-material-themes/themes/material-palenight.css";
import CodeMirror, { StateEffect, useCodeMirror } from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { gutter, lineNumbers } from "@codemirror/gutter";
// import { highlight, languages } from "prismjs/components/prism-core";
// import "prismjs/components/prism-clike";
// import "prismjs/components/prism-css";
// import "prismjs/components/prism-markup";
import { Extension } from "@codemirror/state";
import { materialPalenight } from "./theme";

// declare const Prism;

// if (typeof Prism !== "undefined") {
//   Prism.manual = true;
// }

// import "prismjs/components/prism-clike";
// import "./prism.css";

type SlimEditorProps = {
  value: string;
  onChange: (value: string) => void;
  theme?: any;
};

export const SlimEditor = ({ value, onChange, theme }: SlimEditorProps) => {
  const [internalValue, setInternalValue] = useState(value);

  const onChangeInternal = value => {
    setInternalValue(value);
    onChange(value);
  };

  useEffect(() => {
    if (internalValue !== value) {
      setInternalValue(value);
    }
  }, [value]);

  // return <div ref={editor} />;

  return (
    <CodeMirror
      theme={materialPalenight}
      value={internalValue}
      height="100%"
      extensions={[
        html(),
        lineNumbers({
          formatNumber() {
            return "";
          }
        })
      ]}
      onChange={value => {
        onChangeInternal(value);
      }}
    />
  );
};
