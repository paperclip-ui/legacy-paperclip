import { ChangeEvent, useEffect, useRef, useState } from "react";
import { noop } from "lodash";

type UseTextInputProps = {
  value: string;
  onValueChange?: (value: string) => any;
};

export const useTextInput = ({
  value,
  onValueChange = noop
}: UseTextInputProps) => {
  const ref = useRef<HTMLInputElement>();
  const [internalValue, setInternalValue] = useState<string>();

  useEffect(() => {
    if (value !== internalValue && ref.current) {
      setInternalValue(value);
      ref.current.value = value;
    }
  }, [ref.current, value, internalValue]);

  const onChange = (event: React.KeyboardEvent) => {
    const value = (event.target as HTMLInputElement).value;
    setInternalValue(value);
    onValueChange(value);
  };

  const inputProps = {
    ref,
    onChange
  };

  return { inputProps };
};
