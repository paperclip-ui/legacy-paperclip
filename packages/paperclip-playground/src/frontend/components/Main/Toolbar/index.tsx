import { APP_LOCATIONS } from "../../../state";
import React, { useState } from "react";
import { useHistory } from "react-router";
import { useSelect } from "../../../../../../paperclip-designer/src/components/Select";
import {
  downloadProjectClicked,
  logoutButtonClicked,
  saveButtonClicked
} from "../../../actions";
import { useAppStore } from "../../../hooks/useAppStore";
import { Button } from "../../Button/index.pc";
import { Auth } from "../auth";
import * as styles from "./index.pc";

export const MainToolbar = () => {
  const { state, dispatch } = useAppStore();
  const [showAuth, setShowAuth] = useState<boolean>();
  const history = useHistory();

  const onSignInClick = () => {
    setShowAuth(true);
  };

  const onAuthClose = () => setShowAuth(false);
  const onLogoutButtonClick = () => {
    dispatch(logoutButtonClicked(null));
    profileSelect.close();
  };
  const onSaveCick = () => {
    dispatch(saveButtonClicked({}));
  };
  const onMyProjectsClick = () => {
    history.push(APP_LOCATIONS.PROJECTS);
  };

  const onDownloadClick = () => {
    window.open(
      `${window.location.protocol}//${state.apiHost}/projects/${state.currentProject.data.id}/package.zip`
    );
  };

  let rightControls;
  let leftControls;

  const profileSelect = useSelect();

  if (state.user) {
    leftControls = (
      <>
        <styles.NavAction save onClick={onSaveCick}>
          {state.currentProject ? "Save" : "Save As..."}
          {state.saving && (
            <styles.SaveStatus
              success={!!state.saving.data}
              failed={!!state.saving.error}
              pending={!state.saving.done}
            />
          )}{" "}
        </styles.NavAction>

        <styles.NavAction
          download
          onClick={onDownloadClick}
          disabled={!state.currentProject?.data}
          title={!state.currentProject?.data && "Save project to download"}
        >
          Download React Code
        </styles.NavAction>
      </>
    );
    rightControls = (
      <>
        <styles.ProfileSelect
          ref={profileSelect.ref}
          onBlur={profileSelect.onBlur}
          menu={
            profileSelect.menuVisible && (
              <styles.ProfileMenu
                onLogoutClick={onLogoutButtonClick}
                onMyProjectsClick={onMyProjectsClick}
              />
            )
          }
        >
          <styles.ProfileSelectButton
            active={profileSelect.menuVisible}
            onClick={profileSelect.onButtonClick}
          >
            <styles.ProfileIcon
              style={{
                backgroundImage: `url(${state.user.avatarUrl})`
              }}
            />
          </styles.ProfileSelectButton>
        </styles.ProfileSelect>
      </>
    );
  } else {
    leftControls = (
      <Button primary onClick={onSignInClick}>
        {state.loadingUserSession ? "Loading..." : "Sign in to save & download"}
      </Button>
    );
  }

  return (
    <>
      <styles.Toolbar
        documentName={state.currentProject?.data?.name || "Untitled"}
        leftControls={leftControls}
        rightControls={rightControls}
      />
      {showAuth && <Auth onClose={onAuthClose} />}
    </>
  );
};
