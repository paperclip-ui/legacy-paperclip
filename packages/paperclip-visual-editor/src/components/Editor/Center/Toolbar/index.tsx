import React from "react";
import * as styles from "./index.pc";
import { useAppStore } from "../../../../hooks/useAppStore";
import {
  zoomInButtonClicked,
  zoomOutButtonClicked,
  paintButtonClicked,
  collapseFrameButtonClicked
} from "../../../../actions";

export const Toolbar = () => {
  const {
    state: { canvas, toolsLayerEnabled, expandedFrameInfo },
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
  const onCollapseButtonClick = () => {
    dispatch(collapseFrameButtonClicked(null));
  };
  return (
    <styles.Container>
      <styles.Controls>
        {/* <styles.PaintButton
          active={toolsLayerEnabled}
          onClick={onPainToolClick}
        /> */}
        {!expandedFrameInfo && (
          <styles.Zoom
            amount={Math.round(canvas.transform.z * 100)}
            onMinusClick={onMinusClick}
            onPlusClick={onPlusClick}
          />
        )}
      </styles.Controls>
      {expandedFrameInfo && (
        <styles.Controls>
          <styles.CollapseButton active onClick={onCollapseButtonClick} />
        </styles.Controls>
      )}
    </styles.Container>
  );
};
