import React from "react";
import { StyleDeclarationInfo } from "paperclip-utils";
import * as styles from "./index.pc";
import { useTextInput } from "../../../../TextInput";

export type StyleRuleProps = {
  info: StyleDeclarationInfo;
  onValueChange: (value) => void;
};

export const StyleDeclaration = ({ info, onValueChange }: StyleRuleProps) => {
  // const { inputProps } = useTextInput({
  //   value: info.value,
  //   onValueChange
  // });

  return (
    <styles.StyleRuleProperty
      disabled={!info.active}
      name={info.name}
      value={
        <styles.StyleRulePropertyRichValue>
          <styles.Expression>{info.value}</styles.Expression>
        </styles.StyleRulePropertyRichValue>
      }
    />
  );
};
