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

  const onDeclarationValueChange = (
    declarationId: string,
    name: string,
    value: string
  ) => {
    dispatch(
      virtualStyleDeclarationValueChanged({
        declarationId,
        name,
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
              onDeclarationValueChange(
                declaration.sourceId,
                declaration.name,
                value
              );
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
      title={info.selectorText}
      computedText={info.selectorText}
      fileName={path.basename(info.sourceUri)}
    />
  );
});
