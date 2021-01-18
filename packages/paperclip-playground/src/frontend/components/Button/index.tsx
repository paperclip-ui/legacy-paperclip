import React from "react";
import * as styles from "./index.pc";

export type ButtonProps = {
  primary?: boolean;
  big?: boolean;
  className?: string;
  children?: any;
};

export const Button = ({ children, primary, big, className }: ButtonProps) => {
  return (
    <styles.Button primary={primary} big={big} className={className}>
      {children}
    </styles.Button>
  );
};
