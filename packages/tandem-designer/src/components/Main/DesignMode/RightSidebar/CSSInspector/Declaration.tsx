import React, { useEffect, useState } from "react";
import { StyleDeclarationInfo } from "@paperclip-ui/utils";
import * as styles from "./index.pc";
import { BlendedTextInput } from "../../../../TextInput/blended";

export type StyleRuleProps = {
  info: StyleDeclarationInfo;
  onValueChange: (value) => void;
  filter?: (value: string) => boolean;
};

export const StyleDeclaration = ({
  info,
  onValueChange,
  filter,
}: StyleRuleProps) => {
  const [editingValue, setEditingValue] = useState(false);
  const [internalValue, setInternalValue] = useState("");

  useEffect(() => {
    setInternalValue(info.value);
  }, [info.value]);

  const onClick = () => setEditingValue(true);
  const onBlur = () => {
    setEditingValue(false);
  };

  return (
    <styles.StyleRuleProperty
      disabled={!info.active}
      name={info.name}
      boldName={filter && filter(info.name)}
      boldValue={filter && filter(info.value)}
      value={
        <styles.StyleRulePropertyValue onClick={onClick}>
          {editingValue ? (
            <styles.Expression key="child">
              <BlendedTextInput
                autoResize
                value={internalValue}
                onValueChange={setInternalValue}
                onEnterPressed={() => {
                  onValueChange(internalValue);
                  setEditingValue(false);
                }}
                onBlur={() => {
                  onValueChange(internalValue);
                  onBlur();
                }}
              />
            </styles.Expression>
          ) : (
            <styles.Expression>{internalValue}</styles.Expression>
          )}
        </styles.StyleRulePropertyValue>
      }
    />
  );
};
