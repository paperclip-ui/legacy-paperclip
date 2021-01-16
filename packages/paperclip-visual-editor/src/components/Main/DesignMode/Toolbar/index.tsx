import React, { useCallback, useState } from "react";
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
  titleDoubleClicked,
  redirectRequest,
} from "../../../../actions";
import { useTextInput } from "../../../TextInput";
import * as qs from "qs";
import { pathToFileURL } from "url";
import { current } from "immer";
import { EnvironmentPopup } from "./EnvironmentPopup";
import { isExpanded } from "../../../../state";

export const Toolbar = () => {
  const { state, dispatch } = useAppStore();
  const { canvas, projectDirectory, readonly, birdseyeFilter } = state;
  const expanded = isExpanded(state);
  const [showEnvironmentPopup, setShowEnvironmentPopup] = useState<boolean>();
  const showBirdseye = state.ui.pathname === "/all";
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
    if (showBirdseye) {
      dispatch(redirectRequest({ pathname: "/canvas" }));
    } else {
      dispatch(redirectRequest({ pathname: "/all" }));
    }
    // dispatch(gridButtonClicked(null));
  };

  const { inputProps } = useTextInput({
    value: birdseyeFilter,
    focus: true,
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
            hidden={expanded || showBirdseye}
          />
        </styles.Controls>

        {(!embedded || showBirdseye) && (
          <styles.Title>
            {showBirdseye ? "All Paperclip UIs 🎨" : relativePath}
          </styles.Title>
        )}
        <styles.Spacer />

        <styles.Controls>
          {expanded ? (
            <styles.CollapseButton active onClick={onCollapseButtonClick} />
          ) : null}
          <styles.PopOutButton onClick={onPopOutButtonClicked} />
        </styles.Controls>
        {readonly && <styles.ReadOnlyBadge />}
      </styles.Container>
      {showEnvironmentPopup && (
        <EnvironmentPopup onBlur={onEnvironmentPopupBlur} />
      )}
    </>
  );
};
