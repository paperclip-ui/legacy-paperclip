import React, { memo } from "react";
import { Modal } from "../../Modal";
import * as styles from "./index.pc";
import { connectGithub, connectGoogle } from "./oauth";
import { useAppStore } from "../../../hooks/useAppStore";

type AuthProps = {
  onClose: () => void;
};

export const Auth = memo(({ onClose }: AuthProps) => {
  const { dispatch } = useAppStore();
  const onConnectClick = connectOuath => async () => {
    await connectOuath(dispatch);
    onClose();
  };

  return (
    <Modal title="Sign in" onClose={onClose}>
      <styles.ConnectServices>
        <styles.ConnectButton
          name="github"
          onClick={onConnectClick(connectGithub)}
        >
          Sign in with GitHub
        </styles.ConnectButton>
        {/* <styles.ConnectButton
          name="google"
          onClick={onConnectClick(connectGoogle)}
        >
          Sign in with Google
        </styles.ConnectButton> */}
      </styles.ConnectServices>
    </Modal>
  );
});
