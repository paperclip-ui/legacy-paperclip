import React from "react";
import { StyleDeclarationInfo } from "paperclip-utils";
import * as styles from "./index.pc";

export type StyleRuleProps = {
  info: StyleDeclarationInfo;
};

export const StyleDeclaration = React.memo(({ info }: StyleRuleProps) => {
  console.log(info);
  return <styles.StyleRuleProperty name={info.name} value={info.value} />;
});
