import React from "react";
import * as styles from "./index.pc";
import { useAppStore } from "../../../../hooks/useAppStore";
import {
  zoomInButtonClicked,
  zoomOutButtonClicked,
  popoutButtonClicked,
  collapseFrameButtonClicked,
  gridButtonClicked,
  birdseyeFilterChanged,
  birdseyeTopFilterBlurred
} from "../../../../actions";
import { useTextInput } from "../../../TextInput";

export const Toolbar = () => {
  const {
    state: {
      canvas,
      embedded,
      expandedFrameInfo,
      showBirdseye,
      readonly,
      birdseyeFilter
    },
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

  const { inputProps } = useTextInput({
    value: birdseyeFilter,
    focus: true,
    onValueChange: (value: string) => {
      dispatch(birdseyeFilterChanged({ value }));
    }
  });

  const onFilterBlur = () => {
    dispatch(birdseyeTopFilterBlurred(null));
  };

  return (
    <styles.Container>
      <styles.Controls>
        {showBirdseye ? (
          <styles.SearchInput
            inputRef={inputProps.ref}
            onChange={inputProps.onChange}
            defaultValue={inputProps.value}
            onBlur={onFilterBlur}
          />
        ) : (
          <styles.MagnifyButton onClick={onGridButtonClick} />
        )}
        {/* <styles.GridButton active={showBirdseye} onClick={onGridButtonClick} /> */}
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

      <styles.Spacer />

      <styles.Controls>
        {embedded ? (
          <styles.PopOutButton onClick={onPopOutButtonClicked} />
        ) : null}
        {expandedFrameInfo ? (
          <styles.CollapseButton active onClick={onCollapseButtonClick} />
        ) : null}
      </styles.Controls>
      {readonly && <styles.ReadOnlyBadge />}
    </styles.Container>
  );
};
