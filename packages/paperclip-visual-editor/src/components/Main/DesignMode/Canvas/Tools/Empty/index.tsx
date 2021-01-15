import React from "react";
import * as styles from "./index.pc";

export type Props = {
  show: boolean;
};
export const Empty = ({ show }: Props) => {
  if (!show) {
    return null;
  }

  return <styles.CTA />;
};
