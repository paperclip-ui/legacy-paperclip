import React, { useLayoutEffect } from "react";
import { useEffect, useRef, useState } from "react";
import { noop } from "lodash";
import * as styles from "./index.pc";

export type TextInputProps = {
  autoResize?: boolean;
  value: string;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
};

export const TextInput = ({
  autoResize,
  onValueChange,
  onBlur,
  value
}: TextInputProps) => {
  const autoResizeDummyRef = useRef<HTMLSpanElement>();
  const { inputProps, refValue } = useTextInput({
    onValueChange,
    onBlur,
    value
  });
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (!autoResizeDummyRef.current) {
      return;
    }
    setWidth(autoResizeDummyRef.current.getBoundingClientRect().width);
  }, [autoResizeDummyRef.current, refValue]);

  return (
    <styles.Container autoResize={autoResize}>
      <input {...inputProps} style={width ? { width } : {}} />
      {autoResize && (
        <styles.DummySpan ref={autoResizeDummyRef}>{refValue}</styles.DummySpan>
      )}
    </styles.Container>
  );
};

type UseTextInputProps = {
  value: string;
  onBlur?: () => void;
  onValueChange?: (value: string) => any;
  onSave?: (value: string) => any;
  onEscape?: () => any;
  select?: boolean;
};

export const useTextInput = ({
  value,
  onValueChange = noop,
  onSave = noop,
  onBlur = noop,
  onEscape = noop,
  select = false
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

  const onChange = (event: any) => {
    // cover contentEditable
    const value =
      (event.target as HTMLInputElement).value || event.target.textContent;
    setRefValue(value);
    onValueChange(value);
  };

  const onFocus = e => {
    if (select) {
      e.target.select();
    }
  };

  const onBlur2 = () => {
    onSave(internalValue);
    onBlur && onBlur();
  };

  const onKeyPress = (event: any) => {
    if (event.key === "Enter") {
      onSave(internalValue);
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
    defaultValue: internalValue
  };

  return { inputProps, refValue };
};
