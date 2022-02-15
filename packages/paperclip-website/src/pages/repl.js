import React from "react";
// import CodeBlock from "../../plugins/theme/CodeBlock";

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
  return null;
  // return (
  //   <CodeBlock live fullScreen showAllFrames={false}>
  //     {EXAMPLE}
  //   </CodeBlock>
  // );
}

export default REPL;
