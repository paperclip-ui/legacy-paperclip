import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import * as styles from "./index.pc";

export type ModalProps = {
  children: any;
  onClose: () => void;
  title?: string;
  footer?: any;
};

export const Modal = ({ children, footer, title, onClose }: ModalProps) => {
  const mount = useMemo(() => {
    return document.createElement("div");
  }, []);

  useEffect(() => {
    document.body.appendChild(mount);
    return () => {
      document.body.removeChild(mount);
    };
  }, [mount]);

  return createPortal(
    <styles.Container onBackgroundClick={onClose}>
      <styles.Content title={title} footer={footer}>
        {children}
      </styles.Content>
    </styles.Container>,
    mount
  );
};
