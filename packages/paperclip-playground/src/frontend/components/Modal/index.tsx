import React, { useEffect, useState } from "react";
import * as styles from "./index.pc";

export type ModalProps = {
  title: string;
  onClose: () => void;
  children: any;
};

export const Modal = ({ title, onClose, children }: ModalProps) => {
  const { onBackgroundClick, visible, onCloseButtonClick } = useModal(onClose);

  return (
    <styles.Container visible={visible} onBackgroundClick={onBackgroundClick}>
      <styles.Content>
        <styles.Header title={title} onCloseButtonClick={onCloseButtonClick} />
        {children}
      </styles.Content>
    </styles.Container>
  );
};

const useModal = onClose => {
  const [visible, setVisible] = useState(false);

  const onCloseEvent = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const onCloseButtonClick = onCloseEvent;
  const onBackgroundClick = onCloseEvent;

  useEffect(() => {
    setTimeout(() => {
      setVisible(true);
    }, 100);
  }, []);

  return {
    onCloseButtonClick,
    onBackgroundClick,
    visible
  };
};
