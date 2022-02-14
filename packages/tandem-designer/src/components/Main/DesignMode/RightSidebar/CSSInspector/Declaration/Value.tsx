import React from "react";
import { BlendedTextInput } from "../../../../../TextInput/blended";
import {
  useDeclarationPart,
  UseDeclarationPartProps,
} from "./useDeclarationPart";

export const DeclarationValue = (props: UseDeclarationPartProps) => {
  const {
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
  } = useDeclarationPart(props);

  return (
    <span tabIndex={editingValue ? -1 : 0} onClick={onClick} onFocus={onFocus}>
      {editingValue ? (
        <BlendedTextInput
          autoResize
          autoFocus
          select
          value={internalValue}
          onKeyDown={(event: React.KeyboardEvent<any>) => {
            if (event.key === "Tab") {
              onSave2();
              if (!event.shiftKey && onTab) {
                onTab();
              }
            }
            onKeyDown(event);
          }}
          onValueChange={setInternalValue}
          onEnterPressed={() => {
            onSave2();
            setEditingValue(false);
          }}
          onBlur={() => {
            onSave2();
            onBlur();
          }}
        />
      ) : (
        internalValue
      )}
    </span>
  );
};
