import { profile } from "console";
import React, { useState } from "react";
import { useSelect } from "../../../../../../paperclip-visual-editor/src/components/Select";
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
    profileSelect.close();
  };
  const onSaveCick = () => {
    dispatch(saveButtonClicked(null));
  };

  let rightControls;
  let leftControls;

  const profileSelect = useSelect();

  if (state.user) {
    leftControls = (
      <>
        <Button primary onClick={onSaveCick}>
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
        <styles.ProfileSelect
          ref={profileSelect.ref}
          onBlur={profileSelect.onBlur}
          menu={
            profileSelect.menuVisible && (
              <styles.ProfileMenu onLogoutClick={onLogoutButtonClick} />
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
