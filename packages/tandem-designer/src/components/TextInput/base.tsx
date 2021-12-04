import { noop } from "lodash";
import { useEffect, useRef, useState } from "react";

export type TextInputProps = {
  autoResize?: boolean;
  value?: string;
  placeholder?: string;
  onEnterPressed?: () => void;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  autoFocus?: boolean;
};

type UseTextInputProps = {
  value: string;
  onBlur?: () => void;
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
  onEscape = noop,
  select = false,
  autoFocus,
}: UseTextInputProps) => {
  const ref = useRef<HTMLInputElement>();
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
    defaultValue: internalValue,
  };

  return { inputProps, refValue };
};
