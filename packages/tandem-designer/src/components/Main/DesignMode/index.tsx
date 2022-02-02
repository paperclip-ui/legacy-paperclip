import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";
import { Footer } from "./Footer";
import { Toolbar } from "./Toolbar";
import * as styles from "./index.pc";
import { Birdseye } from "./Birdseye";
import { ErrorBanner } from "./ErrorBanner";
import { useAppStore } from "../../../hooks/useAppStore";
import { isMediaFile } from "@tandem-ui/common/lib/mime";
import { RightSidebar } from "./RightSidebar";
import { MediaPreview } from "./MediaPreview";
import { isPaperclipFile } from "@paperclip-ui/utils";
import { useDragger } from "../../../hooks/useDragger";
import { WindowResizer } from "./WindowResizer";
import { Quickfind } from "./Quickfind";
import { useDragLayer } from "react-dnd";

export type DesignModeProps = {
  floating: boolean;
};

export const DesignMode = ({ floating }: DesignModeProps) => {
  const { state, dispatch } = useAppStore();

  const canvasFile = state.designer.ui.query.canvasFile;
  const floatingPreview = state.designer.floatingPreview;
  const [resizing, setResizing] = useState(false);

  let content;

  const [style, setStyle] = useState<any>({});
  const ref = useRef<HTMLDivElement>();

  const onResizeStart = () => {
    setResizing(true);
  };

  const onResizeStop = () => {
    setResizing(false);
  };

  const dragger = useDragger((props, pos) => {
    setStyle({
      left: pos.left + props.delta.x,
      top: pos.top + props.delta.y,
      // left: clamp(pos.left + props.delta.x, 0, window.innerWidth - pos.width),
      // top: clamp(pos.top + props.delta.y, 0, window.innerHeight - pos.height)
    });
  });

  const onTitleMouseDown = (event: React.MouseEvent<any>) => {
    const offParent = ref.current.offsetParent;
    const offRect = offParent.getBoundingClientRect();
    const rect = ref.current.getBoundingClientRect();

    dragger.onMouseDown(event, {
      left: rect.x - offRect.x,
      top: rect.y - offRect.y,
      width: rect.width,
      height: rect.height,
    });
  };

  if (state.designer.ui.query.showAll || !state.designer.ui.query.canvasFile) {
    content = <Birdseye />;
  } else {
    if (isMediaFile(canvasFile)) {
      content = <MediaPreview src={canvasFile} />;
    } else if (isPaperclipFile(canvasFile)) {
      content = (
        <styles.Center>
          <Quickfind />
          <Canvas />
          <Footer />
        </styles.Center>
      );
    } else {
      content = <styles.NoPreview />;
    }
  }

  let outer = (
    <styles.Container>
      <Toolbar onMouseDown={floatingPreview && onTitleMouseDown} />
      <styles.CanvasContainer disabled={dragger.dragging || resizing}>
        {content}
        <RightSidebar />
      </styles.CanvasContainer>
      <ErrorBanner error={state.designer.currentError} dispatch={dispatch} />
    </styles.Container>
  );

  if (floating) {
    outer = (
      <WindowResizer
        ref={ref}
        style={style}
        styles={{ Container: styles.DesignModeResizer }}
        onResizeStart={onResizeStart}
        onResizeStop={onResizeStop}
      >
        {outer}
      </WindowResizer>
    );
  }

  return outer;
};
