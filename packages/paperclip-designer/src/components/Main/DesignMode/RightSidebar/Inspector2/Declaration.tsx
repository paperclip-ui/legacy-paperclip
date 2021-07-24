import React, { useState } from "react";
import { StyleDeclarationInfo } from "paperclip-utils";
import * as styles from "./index.pc";
import { TextInput } from "../../../../TextInput";

export type StyleRuleProps = {
  info: StyleDeclarationInfo;
  onValueChange: (value) => void;
};

export const StyleDeclaration = ({ info, onValueChange }: StyleRuleProps) => {
  const [editingValue, setEditingValue] = useState(false);

  const onClick = () => setEditingValue(false);
  const onBlur = () => {
    setEditingValue(false);
  };

  return (
    <styles.StyleRuleProperty
      disabled={!info.active}
      name={info.name}
      value={
        <styles.StyleRulePropertyValue onClick={onClick}>
          {editingValue ? (
            <styles.Expression>
              <TextInput
                autoResize
                value={info.value}
                onValueChange={onValueChange}
                onBlur={onBlur}
              />
            </styles.Expression>
          ) : (
            <styles.Expression>{info.value}</styles.Expression>
          )}
        </styles.StyleRulePropertyValue>
      }
    />
  );
};
