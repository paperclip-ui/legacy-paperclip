import { ChangeEvent, useEffect, useRef, useState } from "react";
import { noop } from "lodash";

type UseTextInputProps = {
  value: string;
  focus?: boolean;
  onValueChange?: (value: string) => any;
};

export const useTextInput = ({
  value,
  focus,
  onValueChange = noop
}: UseTextInputProps) => {
  const ref = useRef<HTMLInputElement>();
  const [internalValue, setInternalValue] = useState<string>(value);

  useEffect(() => {
    if (ref.current && value !== ref.current.value) {
      setInternalValue(value);
      ref.current.value = value || "";
    }
  }, [ref.current, focus, value, internalValue]);

  useEffect(() => {
    if (focus && ref.current) {
      ref.current.focus();
      setTimeout(() => {
        ref.current.select();
      });
    }
  }, [focus, ref.current]);

  const onChange = (event: React.KeyboardEvent) => {
    const value = (event.target as HTMLInputElement).value;
    setInternalValue(value);
    onValueChange(value);
  };

  const inputProps = {
    ref,
    onChange,
    value: internalValue
  };

  return { inputProps };
};
