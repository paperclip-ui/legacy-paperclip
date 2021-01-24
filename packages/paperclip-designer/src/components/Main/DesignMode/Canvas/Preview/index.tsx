import React, { useEffect, useRef } from "react";
import { useAppStore } from "../../../../../hooks/useAppStore";
import * as styles from "./index.pc";

declare const TARGET_URI;
declare const PROTOCOL;

export const Preview = React.memo(() => {
  // const {
  //   state: {
  //     rendererElement,
  //     frameSize,
  //     canvas: { scrollPosition }
  //   }
  // } = useAppStore();
  // const mountRef = useRef<HTMLDivElement>();

  // useEffect(() => {
  //   if (rendererElement && mountRef.current) {
  //     mountRef.current.appendChild(rendererElement);
  //   }
  // }, [mountRef, rendererElement]);

  // useEffect(() => {
  //   const scrollingElement = rendererElement.contentDocument.scrollingElement;
  //   scrollingElement.scrollTop = scrollPosition.y;
  //   scrollingElement.scrollLeft = scrollPosition.x;
  // }, [rendererElement, scrollPosition.x, scrollPosition.y, frameSize?.width, frameSize?.height]);

  // return <styles.Preview ref={mountRef} />;

  return null;
});
