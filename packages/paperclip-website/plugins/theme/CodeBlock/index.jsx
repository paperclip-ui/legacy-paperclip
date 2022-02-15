import React, { useEffect, useRef, useMemo } from "react";
import CodeBlock from "@theme/CodeBlock";

export default (props) => {
  if (props.live && false) {
    return (
      <LiveEditor expanded={props.expanded !== "false"} {...props}>
        {props.children}
      </LiveEditor>
    );
  }

  return <CodeBlock {...props} />;
};

const LiveEditor = ({
  children,
  height = 400,
  fullScreen,
  expanded,
  showAllFrames,
  noMargin,
  ...rest
}) => {
  const mountRef = useRef();
  const graph = useMemo(() => extractContent(children), [children]);

  useEffect(() => {
    if (!mountRef.current || typeof window === "undefined") {
      return;
    }

    const extStyle = {};

    if (fullScreen) {
      Object.assign(extStyle, {
        height: "100vh",
      });
    } else {
      Object.assign(extStyle, {
        height,
        margin: noMargin !== true ? "16px 0px" : undefined,
      });
    }

    Object.assign(mountRef.current.style, extStyle);

    // import("@paperclip-ui/repl/src/app").then((module) => {
    //   const app = new module.App(
    //     {
    //       files: graph,
    //       entry: Object.keys(graph)[0],
    //       activeFrame: showAllFrames ? null : 0,
    //       ...rest,
    //     },
    //     mountRef.current
    //   );

    //   app.init();
    // });
  }, [mountRef.current]);

  return <div ref={mountRef}></div>;
};

const extractContent = (text) => {
  const content = String(text);
  const files = content.split(/\/\/\s*file:\s*/g).filter(Boolean);
  const graph = {};

  let entry;

  for (const file of files) {
    const name = (file.match(/(.*?\.(pc|css))/) || [, "main.pc"])[1];
    if (!entry) {
      entry = name;
    }

    const content = file.replace(name, "").trim();
    graph["file:///" + name] = content;
  }

  return graph;
};
