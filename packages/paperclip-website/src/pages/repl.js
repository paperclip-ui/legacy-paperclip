import React from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import CodeBlock from "../../plugins/theme/CodeBlock";

const EXAMPLE = `
// file: main.pc
<div>
  <style>
    color: orange;
    font-family: sans-serif;
    @media screen and (max-width: 400px) {
      color: blue;
      font-size: 42px;
    }
  </style>
  Hello world
</div>
`;

function REPL() {
  return (
    <CodeBlock live fullScreen>
      {EXAMPLE}
    </CodeBlock>
  );
}

export default REPL;
