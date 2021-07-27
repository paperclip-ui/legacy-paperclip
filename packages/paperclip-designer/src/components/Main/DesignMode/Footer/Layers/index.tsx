import React, { useCallback } from "react";
import { identity } from "lodash";
import { AppState, getCurrentPreview } from "../../../../../state";
import { useDispatch, useSelector } from "react-redux";
import { getNodeByPath, nodePathToAry, VirtualElement } from "paperclip-utils";
import { Element } from "./Element";
import * as styles from "./index.pc";
import {
  layerExpandToggleClicked,
  layerLeafClicked
} from "../../../../../actions";

export const Layers = React.memo(() => {
  const state: AppState = useSelector(identity);
  const dispatch = useDispatch();

  const onLeafClick = useCallback((nodePath: string, metaKey: boolean) => {
    dispatch(layerLeafClicked({ nodePath, metaKey }));
  }, []);

  const onExpandToggleClick = useCallback(
    (nodePath: string) => {
      dispatch(layerExpandToggleClicked({ nodePath }));
    },
    [dispatch]
  );

  if (state.designer.selectedNodePaths.length !== 1) {
    return null;
  }
  const selectedNodePath = state.designer.selectedNodePaths[0];
  const nodePath = nodePathToAry(selectedNodePath);
  const preview = getCurrentPreview(state.designer);
  const frame = getNodeByPath(String(nodePath[0]), preview) as VirtualElement;

  return (
    <styles.Container>
      <Element
        selectedNodePath={selectedNodePath}
        path={String(nodePath[0])}
        onExpandToggleClick={onExpandToggleClick}
        onLeafClick={onLeafClick}
        value={frame}
        expandedPaths={state.designer.expandedNodePaths}
      />
    </styles.Container>
  );
});
