import * as React from "react";
// import { Link } from "gatsby";
import Home, {styled} from "./home.pc";
import Highlight, { defaultProps, Language } from "prism-react-renderer";

const Pre = styled("pre");

const PC_CODE = `

<!-- counter.pc -->

<!--
Styles are scoped to this file
-->

<style> 
  .counter {
    font-family: Helvetica;
    cursor: pointer;
  }
</style>

<!-- 
Re-usable blocks of HTML that you can
import into your app code.
-->

<component id="Counter">
  <div class="counter" {onClick}>
    Current count: {currentCount}
  </div>
</component>

<!-- 
Preview elements allow you to see what 
all of your components look like together. 
-->

<preview>
  <Counter currentCount={10} />
</preview>

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
  language: Language,
  code: string
};

const CodeBlock = ({code, language}: CodeBlockProps) => <Highlight {...defaultProps} code={code} language={language}>
{({ className, style, tokens, getLineProps, getTokenProps }) => (
  <Pre className={className} style={style}>
    {tokens.map((line, i) => (
      <div {...getLineProps({ line, key: i })}>
        {line.map((token, key) => (
          <span {...getTokenProps({ token, key })} />
        ))}
      </div>
    ))}
  </Pre>
)}
</Highlight>;


const IndexPage = () => {
  return <Home paperclipSnippet={
    <CodeBlock code={PC_CODE} language="markup" />
  } reactSnippet={
    <CodeBlock code={JS_CODE} language="jsx" />
  } />
};

export default IndexPage;
