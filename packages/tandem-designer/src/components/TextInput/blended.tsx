import React, { useLayoutEffect } from "react";
import { useRef, useState } from "react";
import * as styles from "./blended.pc";
import { TextInputProps, useTextInput } from "tandem-design-system";

export const BlendedTextInput = ({
  autoResize,
  onValueChange,
  onBlur,
  value,
  placeholder
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
      <input
        {...inputProps}
        placeholder={placeholder}
        style={width ? { width } : {}}
      />
      {autoResize && (
        <styles.DummySpan ref={autoResizeDummyRef}>{refValue}</styles.DummySpan>
      )}
    </styles.Container>
  );
};
