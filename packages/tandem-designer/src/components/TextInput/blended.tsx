import React, { useLayoutEffect } from "react";
import { useRef, useState } from "react";
import * as styles from "./blended.pc";
import { TextInputProps, useTextInput } from "@tandem-ui/design-system";

export const BlendedTextInput = ({
  autoResize,
  onValueChange,
  onEnterPressed,
  onBlur,
  value,
  placeholder,
}: TextInputProps) => {
  const autoResizeDummyRef = useRef<HTMLSpanElement>();
  const { inputProps, refValue } = useTextInput({
    onValueChange,
    onEnterPressed,
    onBlur,
    value,
  });

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (!autoResizeDummyRef.current) {
      return;
    }
    setWidth(autoResizeDummyRef.current.getBoundingClientRect().width);
    setHeight(autoResizeDummyRef.current.getBoundingClientRect().height);
  }, [autoResizeDummyRef.current, refValue]);

  return (
    <styles.Container autoResize={autoResize}>
      <input {...inputProps} style={width ? { width, height } : {}} />
      {autoResize && (
        <styles.DummySpan ref={autoResizeDummyRef}>{refValue}</styles.DummySpan>
      )}
    </styles.Container>
  );
};
