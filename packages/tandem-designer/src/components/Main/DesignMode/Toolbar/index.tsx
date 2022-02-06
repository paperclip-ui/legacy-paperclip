import React, { useCallback, useState } from "react";
import * as styles from "./index2.pc";
import { useAppStore } from "../../../../hooks/useAppStore";
import {
  zoomInButtonClicked,
  zoomOutButtonClicked,
  birdseyeFilterChanged,
  titleDoubleClicked,
  redirectRequest,
  zoomInputChanged,
  popoutButtonClicked,
} from "../../../../actions";
import { useTextInput } from "@tandem-ui/design-system";
import { isExpanded } from "../../../../state";

const WIN_ENV =
  typeof window !== "undefined"
    ? /^win/i.test(String(window?.navigator?.platform))
    : null;

export type ToolbarProps = {
  onMouseDown: (event: React.MouseEvent<any>) => void;
  onMouseUp?: (event: React.MouseEvent<any>) => void;
};

export const Toolbar = ({ onMouseDown, onMouseUp }: ToolbarProps) => {
  const { state, dispatch } = useAppStore();
  const {
    designer: { canvas, projectDirectory, sharable, readonly, birdseyeFilter },
  } = state;
  const expanded = isExpanded(state.designer);
  const [showEnvironmentPopup, setShowEnvironmentPopup] = useState<boolean>();
  const showingBirdsEye =
    state.designer.ui.query.showAll || !state.designer.ui.query.canvasFile;
  const [showZoomInput, setShowZoomInput] = useState<boolean>();
  const { embedded, canvasFile } = state.designer.ui.query;
  const showFullEditor = state.designer.workspace?.showFullEditor && !embedded;

  const onMinusClick = () => {
    dispatch(zoomOutButtonClicked(null));
  };
  const onPlusClick = () => {
    dispatch(zoomInButtonClicked(null));
  };
  const onPopOutButtonClicked = () => {
    // setShowEnvironmentPopup(!showEnvironmentPopup);
    dispatch(popoutButtonClicked(null));
  };
  const onCollapseButtonClick = useCallback(() => {
    dispatch(
      redirectRequest({
        query: {
          ...state.designer.ui.query,
          expanded: undefined,
        },
      })
    );
  }, [state.designer.ui]);

  const onGridButtonClick = () => {
    if (showingBirdsEye) {
      dispatch(redirectRequest({ query: { showAll: null } }));
    } else {
      dispatch(redirectRequest({ query: { showAll: true } }));
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

  const relativePath =
    projectDirectory?.url &&
    canvasFile?.replace(projectDirectory?.url, "").replace(/^\//, "");

  const onDoubleClick = () => {
    dispatch(titleDoubleClicked({ uri: canvasFile }));
  };

  const zoom = String(Math.round(canvas.transform.z * 100));

  const { inputProps: zoomInputProps } = useTextInput({
    value: zoom,
    select: true,
    onEscape() {
      setShowZoomInput(false);
    },
    onEnterPressed() {
      setShowZoomInput(false);
    },
    onValueChange: (value) => {
      dispatch(zoomInputChanged({ value: Number(value.replace("%", "")) }));
    },
  });

  return (
    <styles.Container>
      <styles.Toolbar
        onDoubleClick={onDoubleClick}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        leftControls={
          <>
            <styles.Tab active={showingBirdsEye} onClick={onGridButtonClick}>
              <styles.GridButton />
            </styles.Tab>
            {!showFullEditor && sharable && !WIN_ENV && (
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
            {(!showFullEditor || showingBirdsEye) &&
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
                    <styles.ZoomInput autoFocus {...zoomInputProps} />
                  )}
                </styles.ZoomContainer>
              </>
            )}
          </>
        }
      />
    </styles.Container>
  );
};
