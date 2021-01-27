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
  zoomInputChanged
} from "../../../../actions";
import { useTextInput } from "../../../TextInput";
import * as qs from "qs";
import { EnvironmentPopup } from "./EnvironmentPopup";
import { isExpanded } from "../../../../state";

export const Toolbar = () => {
  const { state, dispatch } = useAppStore();
  const {
    designer: { canvas, projectDirectory, sharable, readonly, birdseyeFilter }
  } = state;
  const expanded = isExpanded(state.designer);
  const [showEnvironmentPopup, setShowEnvironmentPopup] = useState<boolean>();
  const showingBirdsEye = state.designer.ui.pathname === "/all";
  const [showZoomInput, setShowZoomInput] = useState<boolean>();
  const { embedded, canvasFile } = state.designer.ui.query;

  const onMinusClick = () => {
    dispatch(zoomOutButtonClicked(null));
  };
  const onPlusClick = () => {
    dispatch(zoomInButtonClicked(null));
  };
  const onPopOutButtonClicked = () => {
    setShowEnvironmentPopup(!showEnvironmentPopup);
  };
  const onCollapseButtonClick = useCallback(() => {
    dispatch(
      redirectRequest({
        query: {
          ...state.designer.ui.query,
          expanded: undefined
        }
      })
    );
  }, [state.designer.ui]);

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
    }
  });

  const onFilterBlur = () => {
    // dispatch(birdseyeTopFilterBlurred(null));
  };

  const onEnvironmentPopupBlur = () => {
    setShowEnvironmentPopup(false);
  };

  const relativePath = canvasFile
    ?.replace(projectDirectory?.url, "")
    .replace(/^\//, "");

  const onDoubleClick = () => {
    dispatch(titleDoubleClicked({ uri: canvasFile }));
  };

  const zoom = String(Math.round(canvas.transform.z * 100));

  const { inputProps: zoomInputProps } = useTextInput({
    value: zoom,
    onValueChange: value => {
      dispatch(zoomInputChanged({ value: Number(value.replace("%", "")) }));
    }
  });

  return (
    <styles.Container>
      <styles.Toolbar
        onDoubleClick={onDoubleClick}
        leftControls={
          <>
            <styles.Tab active={showingBirdsEye} onClick={onGridButtonClick}>
              <styles.GridButton />
            </styles.Tab>
            {sharable && (
              <styles.Tab
                active={showEnvironmentPopup}
                onClick={onPopOutButtonClicked}
              >
                <styles.EnvButton />
              </styles.Tab>
            )}
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
            {!showingBirdsEye && (
              <>
                {expanded && (
                  <styles.Tab active onClick={onCollapseButtonClick}>
                    <styles.CollapseButton />
                  </styles.Tab>
                )}
                <styles.ZoomContainer>
                  {!showZoomInput && (
                    <styles.ZoomLabel onClick={() => setShowZoomInput(true)}>
                      {zoom}%
                    </styles.ZoomLabel>
                  )}

                  {showZoomInput && (
                    <styles.ZoomInput
                      onBlur={() => setShowZoomInput(false)}
                      onKeyPress={e =>
                        e.key === "Enter" && setShowZoomInput(false)
                      }
                      onFocus={e => setTimeout(() => e.target.select(), 10)}
                      autoFocus
                      {...zoomInputProps}
                    />
                  )}
                </styles.ZoomContainer>
              </>
            )}
          </>
        }
      />
      {showEnvironmentPopup && (
        <EnvironmentPopup onBlur={onEnvironmentPopupBlur} />
      )}
    </styles.Container>
  );
};
