import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import * as path from "path";
import { AppState } from "../../../../../../state";
import { useDispatch, useSelector } from "react-redux";
import * as styles from "../index.pc";
import {
  squashInspection,
  ComputedDeclarationInfo,
  StyleRuleInfo,
} from "@paperclip-ui/utils";
import { DeclarationValue as DeclarationPart } from "../Declaration";
import { uiActions } from "../../../../../../actions";
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
