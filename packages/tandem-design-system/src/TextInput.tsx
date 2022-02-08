import React from "react";
import { noop } from "lodash";
import { useEffect, useRef, useState } from "react";
import * as styles from "./TextInput.pc";

export const TextInput = ({
  value,
  big,
  secondary,
  onValueChange,
  onBlur,
  placeholder,
  onKeyDown,
  onEnterPressed,
  wide,
  autoFocus,
}: TextInputProps) => {
  const { inputProps } = useTextInput({
    value,
    onValueChange,
    onBlur,
    onKeyDown,
    onEnterPressed,
    autoFocus,
  });
  return (
    <styles.default
      type="text"
      big={big}
      wide={wide}
      secondary={secondary}
      placeholder={placeholder}
      {...inputProps}
    />
  );
};

export type TextInputProps = {
  autoResize?: boolean;
  value?: string;
  placeholder?: string;
  select?: boolean;
  big?: boolean;
  secondary?: boolean;
  wide?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<any>) => void;
  onEnterPressed?: () => void;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  autoFocus?: boolean;
};

type UseTextInputProps = {
  value: string;
  onBlur?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<any>) => void;
  onValueChange?: (value: string) => any;
  onEnterPressed?: (value: string) => any;
  onEscape?: () => any;
  select?: boolean;
  autoFocus?: boolean;
};

export const useTextInput = ({
  value,
  onValueChange = noop,
  onEnterPressed = noop,
  onBlur = noop,
  onKeyDown = noop,
  onEscape = noop,
  select = false,
  autoFocus,
}: UseTextInputProps) => {
  const ref = useRef<any>();
  const [internalValue, setInternalValue] = useState<string>(value);
  const [refValue, setRefValue] = useState<string>(value);

  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value);
      if (ref.current) {
        ref.current.value = value || "";
        setRefValue(ref.current.value);
      }
    }
  }, [ref.current, value, internalValue]);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        ref.current?.focus();
      }, 5);
    }
  }, [ref.current, autoFocus]);

  const onChange = (event: any) => {
    // cover contentEditable
    const value =
      (event.target as HTMLInputElement).value || event.target.textContent;
    setRefValue(value);
    onValueChange(value);
  };

  const onFocus = (e) => {
    if (select) {
      e.target.select();
    }
  };

  const onBlur2 = () => {
    onEnterPressed && onEnterPressed(internalValue);
    onBlur && onBlur();
  };

  const onKeyPress = (event: any) => {
    if (event.key === "Enter") {
      onEnterPressed(internalValue);
    } else if (event.key === "Escape") {
      onEscape();
    }
  };

  const inputProps = {
    ref,
    onChange,
    onFocus,
    onBlur: onBlur2,
    onKeyPress,
    onKeyDown,
    defaultValue: internalValue,
  };

  return { inputProps, refValue };
};
