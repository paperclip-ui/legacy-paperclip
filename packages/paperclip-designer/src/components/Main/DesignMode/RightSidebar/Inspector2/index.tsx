import React, { useEffect } from "react";
import * as styles from "./index.pc";
import { useAppStore } from "../../../../../hooks/useAppStore";
import { StyleRule } from "./StyleRule";

export const Inspector2 = React.memo(() => {
  const { state } = useAppStore();

  if (!state.designer.selectedNodeStyleInspections.length) {
    return null;
  }

  const inspection = state.designer.selectedNodeStyleInspections[0];

  return (
    <>
      <styles.Container>
        {inspection.styleRules.map(rule => {
          return <StyleRule key={rule.sourceId} info={rule} />;
        })}
      </styles.Container>
    </>
  );
});
