import React, { useEffect, useMemo, useState } from "react";
import * as styles from "./index.pc";
import { useAppStore } from "../../../../../hooks/useAppStore";
import { StyleRule } from "./StyleRule";
import { useTextInput } from "../../../../TextInput";
import * as ast from "paperclip-utils";

export const Inspector2 = React.memo(() => {
  const { state, dispatch } = useAppStore();
  const [filterText, setFilterText] = useState("");

  const filter = useMemo(() => {
    if (!filterText) {
      return null;
    }

    const parts = filterText.split(" ");
    return (value: string) =>
      parts.some(part => {
        return value.includes(part);
      });
  }, [filterText]);

  if (!state.designer.selectedNodeStyleInspections.length) {
    return null;
  }

  const inspection = state.designer.selectedNodeStyleInspections[0];

  return (
    <>
      <styles.Container>
        <Header onFilterChange={setFilterText} />
        <styles.StyleSection title="Element styles">
          {inspection.styleRules
            .filter(rule => !rule.inherited && filterRule(rule, filter))
            .map(rule => {
              return (
                <StyleRule
                  dispatch={dispatch}
                  filter={filter}
                  key={rule.sourceId}
                  info={rule}
                />
              );
            })}
        </styles.StyleSection>
        <styles.StyleSection title="Inherited styles">
          {inspection.styleRules
            .filter(rule => rule.inherited && filterRule(rule, filter))
            .map(rule => {
              return (
                <StyleRule
                  dispatch={dispatch}
                  filter={filter}
                  key={rule.sourceId}
                  info={rule}
                />
              );
            })}
        </styles.StyleSection>
      </styles.Container>
    </>
  );
});

const filterRule = (
  rule: ast.StyleRuleInfo,
  filter?: (v: string) => boolean
) => {
  return (
    !filter ||
    filter(rule.selectorText) ||
    rule.declarations.some(decl => {
      return filter(decl.name) || filter(decl.value);
    })
  );
};

type HeaderProps = {
  onFilterChange: (value: string) => void;
};

const Header = React.memo(({ onFilterChange }: HeaderProps) => {
  const { inputProps } = useTextInput({
    onValueChange: onFilterChange,
    value: ""
  });
  return <styles.Header input={<styles.FilterInput {...inputProps} />} />;
});
