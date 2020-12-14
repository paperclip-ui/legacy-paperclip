import React from "react";
import { FramesRenderer } from "paperclip-web-renderer";
import { memo, useEffect, useMemo } from "react";
import { engineDelegateEventsHandled } from "../../../../../actions";
import { useAppStore } from "../../../../../hooks/useAppStore";

export const Frames = memo(() => {
  const { state, dispatch } = useAppStore();

  const renderer = useMemo(() => {
    const renderer = new FramesRenderer(state.currentFileUri, "file://");
    // TODO: initialize
    return renderer;
  }, [state.currentFileUri]);

  useEffect(() => {
    if (state.currentEngineEvents.length) {
      state.currentEngineEvents.forEach(renderer.handleEngineDelegateEvent);
      dispatch(engineDelegateEventsHandled(undefined));
    }
  }, [renderer, state.currentEngineEvents]);

  return (
    <>
      <div>FRAME</div>
    </>
  );
});
