import React from "react";
import * as styles from "./index.pc";
import { useAppStore } from "../../../../hooks/useAppStore";
import { zoomInButtonClicked, zoomOutButtonClicked } from "../../../../actions";

export const Toolbar = () => {
  const {
    state: { canvas },
    dispatch
  } = useAppStore();
  const onMinusClick = () => {
    dispatch(zoomOutButtonClicked(null));
  };
  const onPlusClick = () => {
    dispatch(zoomInButtonClicked(null));
  };
  return (
    <styles.Container>
      <styles.Zoom
        amount={Math.round(canvas.transform.z * 100)}
        onMinusClick={onMinusClick}
        onPlusClick={onPlusClick}
      />
    </styles.Container>
  );
};
