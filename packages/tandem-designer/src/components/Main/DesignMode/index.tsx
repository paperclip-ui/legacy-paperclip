import React from "react";
import * as styles from "./index.pc";
import { Canvas } from "./Canvas";
import { Toolbar } from "./Toolbar";
import { ErrorBanner } from "./ErrorBanner";
import { useAppStore } from "../../../hooks/useAppStore";
import { Birdseye } from "./Birdseye";
import { RightSidebar } from "./RightSidebar";
import { Footer } from "./Footer";
import { isMediaFile } from "tandem-common/lib/mime";
import { MediaPreview } from "./MediaPreview";
import { isPaperclipFile } from "paperclip-utils";

export const DesignMode = () => {
  const { state, dispatch } = useAppStore();

  const canvasFile = state.designer.ui.query.canvasFile;

  let content;

  if (state.designer.ui.query.showAll) {
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
  return (
    <styles.Container>
      <Toolbar />
      <styles.CanvasContainer>
        {content}
        <RightSidebar />
      </styles.CanvasContainer>
      <ErrorBanner error={state.designer.currentError} dispatch={dispatch} />
    </styles.Container>
  );
};
