import React, { useState } from "react";
import { useAppStore } from "../../../hooks/useAppStore";
import { Button } from "../../Button/index.pc";
import { Auth } from "../auth";
import * as styles from "./index.pc";

export const MainToolbar = () => {
  const { state } = useAppStore();
  const [showAuth, setShowAuth] = useState<boolean>();

  const onSignInClick = () => {
    setShowAuth(true);
  };

  const onAuthClose = () => setShowAuth(false);

  let rightControls;

  if (state.session) {
    rightControls = (
      <styles.ProfileIcon
        style={{
          backgroundUrl: state.session.iconUrl,
        }}
      />
    );
  } else {
    rightControls = (
      <Button primary onClick={onSignInClick}>
        Sign in to save
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
