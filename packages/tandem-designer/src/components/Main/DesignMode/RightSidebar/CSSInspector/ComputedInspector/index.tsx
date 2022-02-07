import React, { memo, useState } from "react";
import * as path from "path";
import { AppState } from "../../../../../../state";
import { useSelector } from "react-redux";
import * as styles from "../index.pc";
import { squashInspection, ComputedDeclarationInfo } from "@paperclip-ui/utils";

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
  const [open, setOpen] = useState(false);
  const onClick = () => {
    setOpen(!open);
  };
  return (
    <styles.ComputedProperty
      collapsed={!open}
      name={info.name}
      value={info.value}
      onClick={onClick}
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
