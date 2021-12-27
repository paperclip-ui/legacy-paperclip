import React, { useEffect, useState } from "react";
import "prism-material-themes/themes/material-palenight.css";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";

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

  const baseTheme = theme && typeof theme.plain === "object" ? theme.plain : {};

  return (
    <SimpleEditor
      value={internalValue}
      style={{
        width: "100%",
        height: "100%",
        fontFamily:
          'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: 15.2,
        letterSpacing: "0.06em",
        ...baseTheme
      }}
      preClassName="language-html"
      onValueChange={onChangeInternal}
      highlight={code =>
        highlight(code, { ...languages.html, ...languages.css }, theme)
      }
    />
  );
};
