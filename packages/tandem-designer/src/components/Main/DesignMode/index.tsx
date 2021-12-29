import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";
import { Footer } from "./Footer";
import { Toolbar } from "./Toolbar";
import * as styles from "./index.pc";
import { Birdseye } from "./Birdseye";
import { ErrorBanner } from "./ErrorBanner";
import { useAppStore } from "../../../hooks/useAppStore";
import { isMediaFile } from "tandem-common/lib/mime";
import { RightSidebar } from "./RightSidebar";
import { MediaPreview } from "./MediaPreview";
import { isPaperclipFile } from "paperclip-utils";
import { useDragger } from "../../../hooks/useDragger";
import { Point } from "../../../state";
import { WindowResizer } from "./WindowResizer";

export type DesignModeProps = {
  floating: boolean;
};

export const DesignMode = ({ floating }: DesignModeProps) => {
  const { state, dispatch } = useAppStore();

  const canvasFile = state.designer.ui.query.canvasFile;
  const floatingPreview = state.designer.floatingPreview;

  let content;

  const [style, setStyle] = useState<any>({});
  const ref = useRef<HTMLDivElement>();

  const dragger = useDragger((props, pos) => {
    setStyle({
      left: pos.left + props.delta.x,
      top: pos.top + props.delta.y
    });
  });

  const onTitleMouseDown = (event: React.MouseEvent<any>) => {
    const offParent = ref.current.offsetParent;
    const offRect = offParent.getBoundingClientRect();
    const rect = ref.current.getBoundingClientRect();
    dragger.onMouseDown(event, {
      left: rect.x - offRect.x,
      top: rect.y - offRect.y
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
          <Canvas />
          <Footer />
        </styles.Center>
      );
    } else {
      content = <styles.NoPreview />;
    }
  }

  let outer = (
    <styles.Container ref={ref} style={style}>
      <Toolbar onMouseDown={floatingPreview && onTitleMouseDown} />
      <styles.CanvasContainer disabled={dragger.dragging}>
        {content}
        <RightSidebar />
      </styles.CanvasContainer>
      <ErrorBanner error={state.designer.currentError} dispatch={dispatch} />
    </styles.Container>
  );

  if (floating) {
    outer = (
      <WindowResizer styles={{ Container: styles.DesignModeResizer }}>
        {outer}
      </WindowResizer>
    );
  }

  return outer;
};
