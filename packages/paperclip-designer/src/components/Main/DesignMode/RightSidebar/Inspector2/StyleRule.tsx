import React from "react";
import { StyleRuleInfo } from "paperclip-utils";
import * as styles from "./index.pc";
import * as path from "path";
import { StyleDeclaration } from "./Declaration";

export type StyleRuleProps = {
  info: StyleRuleInfo;
};

export const StyleRule = React.memo(({ info }: StyleRuleProps) => {
  return (
    <styles.StyleRule
      header={<StyleRuleHeader info={info} />}
      properties={info.declarations.map((declaration, i) => {
        return <StyleDeclaration info={declaration} />;
      })}
    />
  );
});

type StyleRuleHeaderProps = {
  info: StyleRuleInfo;
};

const StyleRuleHeader = React.memo(({ info }: StyleRuleHeaderProps) => {
  return (
    <styles.SelectorInfo
      computedText={info.selectorText}
      fileName={path.basename(info.sourceUri)}
    />
  );
});
