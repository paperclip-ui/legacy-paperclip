import * as React from "react";
import Home, {scopedStyleProps} from "./home.pc";
const SyntaxHighlighter = require("react-syntax-highlighter").default;
const { atomOneDark: codeStyle } = require("react-syntax-highlighter/dist/esm/styles/hljs");
// agate
// androidstudio
const PC_CODE = `

<!-- counter.pc -->

<!--
Styles are scoped to this file
-->

<style> 
  #Counter {
    font-family: Helvetica;
    cursor: pointer;
  }
</style>

<!-- 
Re-usable blocks of HTML that you can
import into your app code.
-->

<div export component as="Counter" {onClick}>
  Current count: {currentCount}
</div>

<!-- 
Preview elements allow you to see what 
all of your components look like together. 
-->

<Counter preview currentCount={10} />
`.trim();

const JS_CODE = `

// list.jsx
import React, {useState} from "react";
import { 
  Counter as BaseConter
} from "./counter.pc";

export function List() {
  const [currentCount, setCount] = useState(0);
  
  const onClick = () => {
    setCount(currentCount + 1);
  };

  return <BaseConter 
    currentCount={currentCount} 
    onClick={onClick} 
  />;
};
`.trim();

type CodeBlockProps = {
  language: string,
  code: string
};

const CodeBlock = ({code, language}: CodeBlockProps) => {
  return <SyntaxHighlighter {...scopedStyleProps} language={language} style={codeStyle}>
  {code}
</SyntaxHighlighter>;
};


const IndexPage = () => {
  return <Home paperclipSnippet={
    <CodeBlock code={PC_CODE} language="markup" />
  } reactSnippet={
    <CodeBlock code={JS_CODE} language="jsx" />
  } />
};

export default IndexPage;
