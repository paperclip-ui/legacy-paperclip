import React, { useEffect, useState } from "react";
import * as styles from "./index.pc";

export type ModalProps = {
  title: any;
  secret?: boolean;
  onClose: () => void;
  children: any;
};

export const Modal = ({ title, secret, onClose, children }: ModalProps) => {
  const { onBackgroundClick, visible, onCloseButtonClick } = useModal(onClose, secret);

  return (
    <styles.Container visible={visible} secret={secret} onBackgroundClick={onBackgroundClick}>
      <styles.Content>
        <styles.Header title={title} onCloseButtonClick={onCloseButtonClick} />
        {children}
      </styles.Content>
    </styles.Container>
  );
};

export const useModal = (onClose, secret: boolean) => {
  const [visible, setVisible] = useState(!secret);


  const onCloseEvent = () => {
    if (secret) {
      return;
    }
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const onCloseButtonClick = onCloseEvent;
  const onBackgroundClick = onCloseEvent;

  useEffect(() => {
    setTimeout(() => {
      setVisible(true);
    }, 100);
  }, [secret]);

  return {
    onCloseButtonClick,
    onBackgroundClick,
    visible
  };
};
