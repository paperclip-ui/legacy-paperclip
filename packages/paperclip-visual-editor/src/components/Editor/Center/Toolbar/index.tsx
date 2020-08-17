import React from "react";
import * as styles from "./index.pc";
import { useAppStore } from "../../../../hooks/useAppStore";
import {
  zoomInButtonClicked,
  zoomOutButtonClicked,
  paintButtonClicked
} from "../../../../actions";

export const Toolbar = () => {
  const {
    state: { canvas, toolsLayerEnabled },
    dispatch
  } = useAppStore();
  const onMinusClick = () => {
    dispatch(zoomOutButtonClicked(null));
  };
  const onPlusClick = () => {
    dispatch(zoomInButtonClicked(null));
  };
  const onPainToolClick = () => {
    dispatch(paintButtonClicked(null));
  };
  return (
    <styles.Container>
      <styles.Controls>
        <styles.PaintButton
          active={toolsLayerEnabled}
          onClick={onPainToolClick}
        />
        {toolsLayerEnabled && (
          <styles.Zoom
            amount={Math.round(canvas.transform.z * 100)}
            onMinusClick={onMinusClick}
            onPlusClick={onPlusClick}
          />
        )}
      </styles.Controls>
    </styles.Container>
  );
};
