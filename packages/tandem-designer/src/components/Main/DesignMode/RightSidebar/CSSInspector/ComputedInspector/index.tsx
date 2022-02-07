import React, { memo, useState } from "react";
import * as path from "path";
import { AppState } from "../../../../../../state";
import { useDispatch, useSelector } from "react-redux";
import * as styles from "../index.pc";
import { squashInspection, ComputedDeclarationInfo } from "@paperclip-ui/utils";
import { DeclarationValue } from "../Declaration";
import { uiActions } from "../../../../../../actions";

export const ComputedInspector = () => {
  const inspection = useSelector(
    (state: AppState) => state.designer.selectedNodeStyleInspections[0]
  );
  const computed = squashInspection(inspection);

  return (
    <>
      <styles.ComputedStyles>
        {computed
          .filter((computed) => !computed.variable)
          .map((info) => (
            <ComputedDeclaration key={info.name} info={info} />
          ))}
      </styles.ComputedStyles>
    </>
  );
};

type ComputedDeclarationProps = {
  info: ComputedDeclarationInfo;
};

const ComputedDeclaration = memo(({ info }: ComputedDeclarationProps) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const onValueChange = (value: string) => {
    dispatch(
      uiActions.computedStyleDeclarationChanged({
        name: info.name,
        value: value,
      })
    );
  };
  const onNameChange = (value: string) => {
    dispatch(
      uiActions.computedStyleDeclarationChanged({
        oldName: info.name,
        name: value,
        value: info.value,
      })
    );
  };
  const onClick = () => {
    setOpen(!open);
  };
  return (
    <styles.ComputedProperty
      collapsed={!open}
      name={<DeclarationValue value={info.name} onChange={onNameChange} />}
      value={<DeclarationValue value={info.value} onChange={onValueChange} />}
      onExpandClick={onClick}
    >
      {open &&
        info.sourceRules.map((rule) => (
          <styles.ComputedPropertySource
            fileName={path.basename(rule.sourceUri)}
            selector={rule.selectorText}
          />
        ))}
    </styles.ComputedProperty>
  );
});
