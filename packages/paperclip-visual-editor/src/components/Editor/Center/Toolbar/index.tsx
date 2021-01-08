import React from "react";
import * as styles from "./index.pc";
import { useAppStore } from "../../../../hooks/useAppStore";
import {
  zoomInButtonClicked,
  zoomOutButtonClicked,
  popoutButtonClicked,
  collapseFrameButtonClicked,
  gridButtonClicked
} from "../../../../actions";

export const Toolbar = () => {
  const {
    state: { canvas, embedded, expandedFrameInfo, showBirdseye },
    dispatch
  } = useAppStore();
  const onMinusClick = () => {
    dispatch(zoomOutButtonClicked(null));
  };
  const onPlusClick = () => {
    dispatch(zoomInButtonClicked(null));
  };
  const onPopOutButtonClicked = () => {
    dispatch(popoutButtonClicked(null));
  };
  const onCollapseButtonClick = () => {
    dispatch(collapseFrameButtonClicked(null));
  };
  const onGridButtonClick = () => {
    dispatch(gridButtonClicked(null));
  };

  return (
    <styles.Container>
      <styles.Controls>
        <styles.GridButton active={showBirdseye} onClick={onGridButtonClick} />
        {/* <styles.PaintButton
          active={toolsLayerEnabled}
          onClick={onPainToolClick}
        /> */}
        {!expandedFrameInfo && !showBirdseye && (
          <styles.Zoom
            amount={Math.round(canvas.transform.z * 100)}
            onMinusClick={onMinusClick}
            onPlusClick={onPlusClick}
          />
        )}
      </styles.Controls>

      <styles.Controls>
        {embedded ? (
          <styles.PopOutButton onClick={onPopOutButtonClicked} />
        ) : null}
        {expandedFrameInfo ? (
          <styles.CollapseButton active onClick={onCollapseButtonClick} />
        ) : null}
      </styles.Controls>
    </styles.Container>
  );
};
