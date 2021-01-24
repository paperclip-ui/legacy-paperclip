import {
  ChangeEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { noop } from "lodash";

type UseTextInputProps = {
  value: string;
  onValueChange?: (value: string) => any;
  onSave?: (value: string) => any;
  select?: boolean;
};

export const useTextInput = ({
  value,
  onValueChange = noop,
  onSave = noop,
  select = false
}: UseTextInputProps) => {
  const ref = useRef<HTMLInputElement>();
  const [internalValue, setInternalValue] = useState<string>(value);

  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value);
      if (ref.current) {
        ref.current.value = value || "";
      }
    }
  }, [ref.current, value, internalValue]);

  const onChange = (event: React.KeyboardEvent) => {
    const value = (event.target as HTMLInputElement).value;
    setInternalValue(value);
    onValueChange(value);
  };

  const onFocus = e => {
    if (select) {
      e.target.select();
    }
  };

  const onBlur = () => {
    onSave(internalValue);
  };

  const onKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      onSave(internalValue);
    }
  };

  const inputProps = {
    ref,
    onChange,
    onFocus,
    onBlur,
    onKeyPress,
    defaultValue: internalValue
  };

  return { inputProps };
};
