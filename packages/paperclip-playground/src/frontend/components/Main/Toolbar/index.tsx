import React, { useState } from "react";
import { logoutButtonClicked } from "../../../actions";
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

  let rightControls;

  if (state.user) {
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
    rightControls = (
      <Button primary onClick={onSignInClick}>
        {state.loadingUserSession ? "Loading..." : "Sign in to save"}
      </Button>
    );
  }

  return (
    <>
      <styles.Toolbar documentName="Untitled" rightControls={rightControls} />
      {showAuth && <Auth onClose={onAuthClose} />}
    </>
  );
};
