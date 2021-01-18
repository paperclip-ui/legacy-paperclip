import React, { memo } from "react";
import { Modal } from "../../Modal";
import * as styles from "./index.pc";

type AuthProps = {
  onClose: () => void;
};

export const Auth = memo(({ onClose }: AuthProps) => {
  return (
    <Modal title="Sign in" onClose={onClose}>
      <styles.ConnectServices>
        <styles.ConnectButton name="github">
          Sign in with GitHub
        </styles.ConnectButton>
        <styles.ConnectButton name="google">
          Sign in with Google
        </styles.ConnectButton>
      </styles.ConnectServices>
    </Modal>
  );
});
