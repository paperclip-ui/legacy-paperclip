import { useState, useEffect } from "react";
import { noop } from "lodash";

export type UseDeclarationPartProps = {
  value: string;
  showInput?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<any>) => void;
  onTab?: () => void;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
};

export const useDeclarationPart = ({
  value,
  onSave = noop,
  onChange = noop,
  showInput,
  onKeyDown = noop,
  onTab = noop,
}: UseDeclarationPartProps) => {
  const [editingValue, setEditingValue] = useState(showInput);
  const [internalValue, setInternalValue] = useState(value);
  const [saved, setSaved] = useState(false);
  const onFocus = () => {
    setEditingValue(true);
  };

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    onChange(internalValue);
    setSaved(false);
  }, [internalValue]);

  const onClick = () => setEditingValue(true);
  const onBlur = () => {
    setEditingValue(false);
  };

  const onSave2 = () => {
    if (saved) {
      return;
    }
    setSaved(true);
    if (internalValue !== value) {
      onSave(internalValue);
    }
  };

  return {
    editingValue,
    onClick,
    onFocus,
    internalValue,
    onSave2,
    onTab,
    onKeyDown,
    setInternalValue,
    setEditingValue,
    onBlur,
  };
};
