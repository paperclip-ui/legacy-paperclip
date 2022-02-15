import React, { useMemo, useState } from "react";
import { AppState } from "../../../../../../state";
import { useSelector } from "react-redux";
import { squashInspection } from "@paperclip-ui/utils";
import * as styles from "../index.pc";
import { StyleDeclarationList } from "../DeclarationList";

export const ComputedInspector = () => {
  const inspection = useSelector(
    (state: AppState) => state.designer.selectedNodeStyleInspections[0]
  );
  const [showNewInput, setShowNewInput] = useState(false);
  const items = useMemo(() => {
    return squashInspection(inspection).filter((comp) => !comp.variable);
  }, [inspection]);

  return (
    <styles.ComputedStylesContainer
      footerControls={
        <styles.AddStyleButton onClick={() => setShowNewInput(true)} />
      }
    >
      <StyleDeclarationList
        computed
        items={items}
        showNewInput={showNewInput}
      />
    </styles.ComputedStylesContainer>
  );
};
