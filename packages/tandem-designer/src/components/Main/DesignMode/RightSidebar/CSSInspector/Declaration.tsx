import React, { useState } from "react";
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
