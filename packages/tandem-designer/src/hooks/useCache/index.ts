import { useMemo, useState } from "react";

export function useCache<TState>(
  id: string,
  initialValue: TState
): [TState, (value: TState) => void] {
  const localValue = useMemo(
    () => localStorage.getItem(id) && JSON.parse(localStorage.getItem(id)),
    []
  );

  const [value, _setValue] = useState<TState>(localValue || initialValue);

  const setValue = (value: TState) => {
    localStorage.setItem(id, JSON.stringify(value));
    _setValue(value);
  };

  return [value, setValue];
}
