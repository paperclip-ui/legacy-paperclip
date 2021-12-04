import React from "react";
import { TextInputProps, useTextInput } from "./base";
import * as styles from "./index.pc";

export const TextInput = ({
  value,
  onValueChange,
  onBlur,
  placeholder,
  onEnterPressed,
  autoFocus,
}: TextInputProps) => {
  const { inputProps } = useTextInput({
    value,
    onValueChange,
    onBlur,
    onEnterPressed,
    autoFocus,
  });
  return (
    <styles.default type="text" placeholder={placeholder} {...inputProps} />
  );
};
