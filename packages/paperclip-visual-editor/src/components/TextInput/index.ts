import { ChangeEvent, useEffect, useRef, useState } from "react";
import { noop } from "lodash";

type UseTextInputProps = {
  value: string;
  select?: boolean;
  onValueChange?: (value: string) => any;
};

export const useTextInput = ({
  value,
  select,
  onValueChange = noop,
}: UseTextInputProps) => {
  const ref = useRef<HTMLInputElement>();
  const [internalValue, setInternalValue] = useState<string>(value);

  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value);
      ref.current.value = value || "";
    }
  }, [ref.current, value, internalValue]);

  useEffect(() => {
    if (select && ref.current) {
      setTimeout(() => {
        ref.current.select();
      });
    }
  }, [select, ref.current]);

  const onChange = (event: React.KeyboardEvent) => {
    const value = (event.target as HTMLInputElement).value;
    setInternalValue(value);
    onValueChange(value);
  };

  const inputProps = {
    ref,
    onChange,
    defaultValue: internalValue,
  };

  return { inputProps };
};
