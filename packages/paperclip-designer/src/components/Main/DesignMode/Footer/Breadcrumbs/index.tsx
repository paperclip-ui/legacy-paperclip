import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getNodeByPath,
  LoadedPCData,
  VirtualNode,
  VirtualNodeKind,
  memoize,
  getElementLabel
} from "paperclip-utils";
import { getActivePCData, getSelectedNodePaths } from "../../../../../state";
import * as styles from "./index.pc";
import {
  nodeBreadcrumbClicked,
  nodeBreadcrumbMouseEntered,
  nodeBreadcrumbMouseLeft
} from "../../../../../actions";
import { Dispatch } from "redux";

export const Breadcrumbs = React.memo(() => {
  const pcData: LoadedPCData = useSelector(getActivePCData);
  const selectedNodePaths = useSelector(getSelectedNodePaths);
  const dispatch = useDispatch();

  if (!pcData || !selectedNodePaths.length) {
    return null;
  }

  const nodePath: number[] = nodePathToAry(selectedNodePaths[0]);

  return (
    <styles.Breadcrumbs>
      {nodePath.map((part, i) => {
        const elPath = sliceAry(nodePath, i + 1);
        const node = getNodeByPath(elPath, pcData.preview) as VirtualNode;
        return (
          <Breadcrumb
            key={elPath.join(".")}
            node={node}
            path={elPath}
            dispatch={dispatch}
            active={i === nodePath.length - 1}
          />
        );
      })}
    </styles.Breadcrumbs>
  );
});

type BreadcrumbProps = {
  node: VirtualNode;
  active: boolean;
  path: number[];
  dispatch: Dispatch;
};

const Breadcrumb = React.memo(
  ({ node, active, path, dispatch }: BreadcrumbProps) => {
    const onBreadcrumbClick = useCallback(
      (event: React.MouseEvent<any>) => {
        dispatch(
          nodeBreadcrumbClicked({
            nodePath: path.join("."),
            metaKey: event.metaKey
          })
        );
      },
      [path, dispatch]
    );

    const onBreadcrumbMouseEnter = useCallback(() => {
      dispatch(nodeBreadcrumbMouseEntered({ nodePath: path.join(".") }));
    }, [path, dispatch]);

    const onBreadcrumbMouseLeave = useCallback(() => {
      dispatch(nodeBreadcrumbMouseLeft({ nodePath: path.join(".") }));
    }, [path, dispatch]);

    let label: string;

    if (node.kind === VirtualNodeKind.Element) {
      label = getElementLabel(node) || node.tagName;
    }

    return (
      <styles.Breadcrumb
        active={active}
        onClick={onBreadcrumbClick}
        onMouseEnter={onBreadcrumbMouseEnter}
        onMouseLeave={onBreadcrumbMouseLeave}
      >
        {label}
      </styles.Breadcrumb>
    );
  }
);

const nodePathToAry = memoize((path: string) => path.split(".").map(Number));
const sliceAry = memoize((path: number[], index: number) => {
  return path.slice(0, index);
});
