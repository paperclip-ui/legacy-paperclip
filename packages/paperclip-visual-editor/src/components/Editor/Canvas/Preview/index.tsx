import React, { useEffect, useState, useRef } from "react";
import { Renderer } from "paperclip-web-renderer";
import { useAppStore } from "../../../../hooks/useAppStore";

declare const TARGET_URI;
declare const PROTOCOL;

export const Preview = React.memo(() => {
  const { state } = useAppStore();
  const [renderer, setRenderer] = useState<Renderer>();
  const mountRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const renderer = new Renderer(
      typeof PROTOCOL === "undefined" ? "http://" : PROTOCOL,
      typeof TARGET_URI === "undefined" ? null : TARGET_URI
    );

    // renderer.onMetaClick()
    mountRef.current.appendChild(renderer.frame);
    setRenderer(renderer);
  }, [mountRef]);

  useEffect(() => {
    if (state.currentEngineError) {
      renderer.handleError(state.currentEngineError);
    } else if (state.currentLoadedData) {
      renderer.initialize(state.currentLoadedData);
    } else if (state.currentEngineEvent) {
      renderer.handleEngineEvent(state.currentEngineEvent);
    }
  }, [
    renderer,
    state.currentEngineError,
    state.currentEngineEvent,
    state.currentLoadedData
  ]);

  return <div ref={mountRef}></div>;
});
