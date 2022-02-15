import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getNodeByPath,
  LoadedPCData,
  VirtualNode,
  VirtualNodeKind,
  memoize,
  getElementLabel,
  isInstance,
} from "@paperclip-ui/utils";
import {
  getAppActivePCData,
  getInspectionInfo,
  getSelectedNodePaths,
} from "../../../../../state";
import * as styles from "./index.pc";
import {
  nodeBreadcrumbClicked,
  nodeBreadcrumbMouseEntered,
  nodeBreadcrumbMouseLeft,
} from "../../../../../actions";
import { Dispatch } from "redux";

export const Breadcrumbs = React.memo(() => {
  const pcData: LoadedPCData = useSelector(getAppActivePCData);
  const inspectionInfo = useSelector(getInspectionInfo);
  const selectedNodePaths = useSelector(getSelectedNodePaths);
  const dispatch = useDispatch();

  const ref = useRef<HTMLDivElement>();

  useLayoutEffect(() => {
    if (!ref.current || !pcData || !selectedNodePaths.length) {
      return;
    }
    const scrollLeft = () => {
      ref.current.scrollLeft = 9999999;
    };

    window.addEventListener("resize", scrollLeft);
    scrollLeft();
    return () => window.removeEventListener("resize", scrollLeft);
  }, [ref.current, pcData, selectedNodePaths, inspectionInfo]);

  if (!pcData || !selectedNodePaths.length) {
    return null;
  }

  const nodePath: number[] = nodePathToAry(selectedNodePaths[0]);

  return (
    <styles.Breadcrumbs ref={ref}>
      {nodePath.map((part, i) => {
        const elPath = sliceAry(nodePath, i + 1);
        const node = getNodeByPath(
          elPath.join("."),
          pcData.preview
        ) as VirtualNode;

        // will happen if node is inserted but doesn't exist yet
        if (!node) {
          return null;
        }
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
            metaKey: event.metaKey,
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
    } else if (node.kind === VirtualNodeKind.Text) {
      label = "text";
    }

    return (
      <styles.Breadcrumb
        active={active}
        instance={isInstance(node)}
        text={node.kind === VirtualNodeKind.Text}
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
