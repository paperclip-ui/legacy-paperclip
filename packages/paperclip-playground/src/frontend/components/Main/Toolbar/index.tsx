import React, { useState } from "react";
import { logoutButtonClicked, saveButtonClicked } from "../../../actions";
import { useAppStore } from "../../../hooks/useAppStore";
import { Button } from "../../Button/index.pc";
import { Auth } from "../auth";
import * as styles from "./index.pc";

export const MainToolbar = () => {
  const { state, dispatch } = useAppStore();
  const [showAuth, setShowAuth] = useState<boolean>();

  const onSignInClick = () => {
    setShowAuth(true);
  };

  const onAuthClose = () => setShowAuth(false);
  const onLogoutButtonClick = () => {
    dispatch(logoutButtonClicked(null));
  };
  const onSaveCick = () => {
    dispatch(saveButtonClicked(null));
  };

  let rightControls;
  let leftControls;

  const saving = state.saving;

  if (state.user) {
    leftControls = (
      <>
        <Button secondary onClick={onSaveCick}>
          Save
        </Button>
        {state.saving && (
          <styles.SaveStatus
            success={!!state.saving.data}
            failed={!!state.saving.error}
            pending={!state.saving.done}
          />
        )}
      </>
    );
    rightControls = (
      <>
        <styles.ProfileIcon
          style={{
            backgroundImage: `url(${state.user.avatarUrl})`,
          }}
        />
        <styles.LogoutButton onClick={onLogoutButtonClick} />
      </>
    );
  } else {
    leftControls = (
      <Button primary onClick={onSignInClick}>
        {state.loadingUserSession ? "Loading..." : "Sign in to save"}
      </Button>
    );
  }

  return (
    <>
      <styles.Toolbar
        documentName="Untitled"
        leftControls={leftControls}
        rightControls={rightControls}
      />
      {showAuth && <Auth onClose={onAuthClose} />}
    </>
  );
};
