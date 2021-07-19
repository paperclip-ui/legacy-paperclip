import React, { useEffect } from "react";
import { StyleRuleInfo } from "paperclip-utils";
import * as styles from "./index.pc";
import * as path from "path";
import { StyleDeclaration } from "./Declaration";
import { useAppStore } from "../../../../../hooks/useAppStore";
import { virtualStyleDeclarationValueChanged } from "../../../../../actions";

export type StyleRuleProps = {
  info: StyleRuleInfo;
};

export const StyleRule = React.memo(({ info }: StyleRuleProps) => {
  const { dispatch } = useAppStore();

  const onDeclarationValueChange = (index: number, value: string) => {
    dispatch(
      virtualStyleDeclarationValueChanged({
        styleId: info.sourceId,
        index,
        value
      })
    );
  };

  return (
    <styles.StyleRule
      header={<StyleRuleHeader info={info} />}
      properties={info.declarations.map((declaration, i) => {
        return (
          <StyleDeclaration
            key={i}
            info={declaration}
            onValueChange={value => {
              onDeclarationValueChange(i, value);
            }}
          />
        );
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
