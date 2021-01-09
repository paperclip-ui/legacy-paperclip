import React, { useState } from "react";
import * as styles from "./index.pc";
import * as path from "path";
import { useAppStore } from "../../../../hooks/useAppStore";
import {
  zoomInButtonClicked,
  zoomOutButtonClicked,
  popoutButtonClicked,
  collapseFrameButtonClicked,
  gridButtonClicked,
  birdseyeFilterChanged,
  birdseyeTopFilterBlurred,
  titleDoubleClicked
} from "../../../../actions";
import { useTextInput } from "../../../TextInput";
import { pathToFileURL } from "url";
import { current } from "immer";
import { useHistory } from "react-router";
import { EnvironmentPopup } from "./EnvironmentPopup";

export const Toolbar = () => {
  const {
    state: {
      canvas,
      embedded,
      expandedFrameInfo,
      projectDirectory,
      readonly,
      birdseyeFilter,
      currentFileUri
    },
    dispatch
  } = useAppStore();
  const [showEnvironmentPopup, setShowEnvironmentPopup] = useState<boolean>();
  const history = useHistory();
  const showBirdseye = history.location.pathname.indexOf("/all") === 0;

  const onMinusClick = () => {
    dispatch(zoomOutButtonClicked(null));
  };
  const onPlusClick = () => {
    dispatch(zoomInButtonClicked(null));
  };
  const onPopOutButtonClicked = () => {
    setShowEnvironmentPopup(true);
  };
  const onCollapseButtonClick = () => {
    dispatch(collapseFrameButtonClicked(null));
  };
  const onGridButtonClick = () => {
    if (showBirdseye) {
      history.push("/canvas" + history.location.search);
    } else {
      history.push("/all" + history.location.search);
    }
    // dispatch(gridButtonClicked(null));
  };

  const { inputProps } = useTextInput({
    value: birdseyeFilter,
    focus: true,
    onValueChange: (value: string) => {
      dispatch(birdseyeFilterChanged({ value }));
    }
  });

  const onFilterBlur = () => {
    // dispatch(birdseyeTopFilterBlurred(null));
  };

  const onEnvironmentPopupBlur = () => {
    setShowEnvironmentPopup(false);
  };

  const relativePath = currentFileUri
    ?.replace(projectDirectory?.url, "")
    .substr(1);

  const onDoubleClick = () => {
    console.log("DOUBLE");
    dispatch(titleDoubleClicked({ uri: currentFileUri }));
  };

  return (
    <>
      <styles.Container onDoubleClick={onDoubleClick}>
        <styles.Controls>
          {/* {showBirdseye ? (
          <styles.SearchInput
            inputRef={inputProps.ref}
            onChange={inputProps.onChange}
            defaultValue={inputProps.value}
            onBlur={onFilterBlur}
          />
        ) : (
          <styles.MagnifyButton onClick={onGridButtonClick} /> 
        )} */}
          <styles.GridButton
            active={showBirdseye}
            onClick={onGridButtonClick}
          />
          {/* <styles.PaintButton
          active={toolsLayerEnabled}
          onClick={onPainToolClick}
        /> */}

          <styles.Zoom
            amount={Math.round(canvas.transform.z * 100)}
            onMinusClick={onMinusClick}
            onPlusClick={onPlusClick}
            hidden={expandedFrameInfo || showBirdseye}
          />
        </styles.Controls>

        {(!embedded || showBirdseye) && (
          <styles.Title>
            {showBirdseye ? "All Paperclip UIs 🎨" : relativePath}
          </styles.Title>
        )}
        <styles.Spacer />

        <styles.Controls>
          <styles.PopOutButton onClick={onPopOutButtonClicked} />
          {expandedFrameInfo ? (
            <styles.CollapseButton active onClick={onCollapseButtonClick} />
          ) : null}
        </styles.Controls>
        {readonly && <styles.ReadOnlyBadge />}
      </styles.Container>
      {showEnvironmentPopup && (
        <EnvironmentPopup onBlur={onEnvironmentPopupBlur} />
      )}
    </>
  );
};
