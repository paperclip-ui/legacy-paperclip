import React, { useMemo } from "react";
import * as path from "path";
import { AppState } from "../../../../../../state";
import { useSelector } from "react-redux";
import { squashInspection } from "@paperclip-ui/utils";
import { StyleDeclarationList } from "../DeclarationList";

export const ComputedInspector = () => {
  const inspection = useSelector(
    (state: AppState) => state.designer.selectedNodeStyleInspections[0]
  );
  const items = useMemo(() => {
    return squashInspection(inspection)
      .filter((comp) => !comp.variable)
      .map((decl) => ({
        name: decl.name,
        value: decl.value,
        sourceRules: decl.sourceRules,
      }));
  }, [inspection]);

  return <StyleDeclarationList computed items={items} />;
};
