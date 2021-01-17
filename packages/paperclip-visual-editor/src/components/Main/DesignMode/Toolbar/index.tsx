import React, { useCallback, useState } from "react";
import * as styles from "./index2.pc";
import * as path from "path";
import { useAppStore } from "../../../../hooks/useAppStore";
import {
  zoomInButtonClicked,
  zoomOutButtonClicked,
  birdseyeFilterChanged,
  titleDoubleClicked,
  redirectRequest,
  zoomInputChanged,
} from "../../../../actions";
import { useTextInput } from "../../../TextInput";
import * as qs from "qs";
import { EnvironmentPopup } from "./EnvironmentPopup";
import { isExpanded } from "../../../../state";

export const Toolbar = () => {
  const { state, dispatch } = useAppStore();
  const {
    canvas,
    projectDirectory,
    sharable,
    readonly,
    birdseyeFilter,
  } = state;
  const expanded = isExpanded(state);
  const [showEnvironmentPopup, setShowEnvironmentPopup] = useState<boolean>();
  const showingBirdsEye = state.ui.pathname === "/all";
  const [showZoomInput, setShowZoomInput] = useState<boolean>();
  const { embedded, currentFileUri } = state.ui.query;

  const onMinusClick = () => {
    dispatch(zoomOutButtonClicked(null));
  };
  const onPlusClick = () => {
    dispatch(zoomInButtonClicked(null));
  };
  const onPopOutButtonClicked = () => {
    setShowEnvironmentPopup(true);
  };
  const onCollapseButtonClick = useCallback(() => {
    dispatch(
      redirectRequest({
        query: {
          ...state.ui.query,
          expanded: undefined,
        },
      })
    );
  }, [state.ui]);

  const onGridButtonClick = () => {
    if (showingBirdsEye) {
      dispatch(redirectRequest({ pathname: "/canvas" }));
    } else {
      dispatch(redirectRequest({ pathname: "/all" }));
    }
    // dispatch(gridButtonClicked(null));
  };

  const { inputProps } = useTextInput({
    value: birdseyeFilter,
    onValueChange: (value: string) => {
      dispatch(birdseyeFilterChanged({ value }));
    },
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
    dispatch(titleDoubleClicked({ uri: currentFileUri }));
  };

  const zoom = String(Math.round(canvas.transform.z * 100)) + "%";

  const { inputProps: zoomInputProps } = useTextInput({
    value: zoom,
    onValueChange: (value) => {
      dispatch(zoomInputChanged({ value: Number(value.replace("%", "")) }));
    },
  });

  return (
    <>
      <styles.Toolbar
        onDoubleClick={onDoubleClick}
        leftControls={
          <>
            <styles.Tab active={showingBirdsEye} onClick={onGridButtonClick}>
              <styles.GridButton />
            </styles.Tab>
            <styles.Tab
              active={showEnvironmentPopup}
              onClick={onGridButtonClick}
            >
              <styles.EnvButton />
            </styles.Tab>
          </>
        }
        title={
          <>
            {(!embedded || showingBirdsEye) &&
              (showingBirdsEye ? "Project Frames" : relativePath)}
          </>
        }
        readOnly={readonly}
        rightControls={
          <>
            {/* <styles.Zoom
            amount={Math.round(canvas.transform.z * 100)}
            onMinusClick={onMinusClick}
            onPlusClick={onPlusClick}
            hidden={expanded || showingBirdsEye}
          /> */}
            <styles.ZoomLabel onClick={() => setShowZoomInput(true)}>
              {zoom}%
            </styles.ZoomLabel>
            <styles.ZoomInput
              onBlur={() => setShowZoomInput(false)}
              onKeyPress={(e) => e.key === "Enter" && setShowZoomInput(false)}
              onDoubleClick={(e) => e.stopPropagation()}
              onClick={(e) => e.target.select()}
              {...zoomInputProps}
            />
          </>
        }
      />
      {showEnvironmentPopup && (
        <EnvironmentPopup onBlur={onEnvironmentPopupBlur} />
      )}
    </>
  );
};
