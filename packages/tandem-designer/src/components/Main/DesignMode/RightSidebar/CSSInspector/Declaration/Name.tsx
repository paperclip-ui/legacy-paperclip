import React, { useEffect, useState } from "react";
import { StyleDeclarationInfo } from "@paperclip-ui/utils";
import * as styles from "../index.pc";
import { BlendedTextInput } from "../../../../../TextInput/blended";
import { noop } from "lodash";
import { RootValue } from "@paperclip-ui/utils/lib/css/decl-value-ast";
import {
  useDeclarationPart,
  UseDeclarationPartProps,
} from "./useDeclarationPart";

export type StyleRuleProps = {
  info: StyleDeclarationInfo;
  onValueChange: (value) => void;
  filter?: (value: string) => boolean;
};

export const DeclarationName = (props: UseDeclarationPartProps) => {
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
