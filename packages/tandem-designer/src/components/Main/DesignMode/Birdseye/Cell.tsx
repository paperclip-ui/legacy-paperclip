import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAppStore } from "../../../../hooks/useAppStore";
import * as styles from "./index.pc";
import { throttle } from "lodash";

import {
  computeVirtScriptObject,
  NodeAnnotations,
  VirtualFrame,
} from "@paperclip-ui/utils";
import * as url from "url";
import { DEFAULT_FRAME_BOX } from "../../../../state";
import { redirectRequest } from "../../../../actions";
import { useFrame } from "../../../../hooks/useFrame";

type CellProps = {
  filter?: string;
  uri: string;
  index: number;
  node: VirtualFrame;
  relativePath: string;
  dispatch: any;
};

export const Cell = ({ uri, index, filter, node, relativePath }: CellProps) => {
  const { mountRef, label, frameBox, scale, onClick } = useCell({
    uri,
    relativePath,
    filter,
    frameIndex: index,
    node,
  });

  const { ref } = useFrame({ frameUri: uri, frameIndex: index });

  return (
    <styles.Cell
      mountRef={mountRef}
      label={label}
      onClick={onClick}
      dir={relativePath}
      controls={null}
    >
      <div
        style={{
          width: frameBox.width,
          height: frameBox.height,
          transform: `scale(${scale})`,
          transformOrigin: `top left`,
        }}
        ref={ref}
      />
    </styles.Cell>
  );
};

type UseCellProps = {
  filter?: string;
  relativePath: string;
  uri: string;
  frameIndex: number;
  node: VirtualFrame;
};

const useCell = ({ uri, frameIndex, node }: UseCellProps) => {
  const annotations: NodeAnnotations = node.annotations
    ? computeVirtScriptObject(node.annotations)
    : {};
  const frameBox = useMemo(
    () => ({ ...DEFAULT_FRAME_BOX, ...annotations.frame }),
    [annotations]
  );
  const { dispatch } = useAppStore();

  const [mountBounds, setMountBounds] = useState<ClientRect | undefined>();
  const [scale, setFrameScale] = useState<number>(1);

  const { label, visible, tags } = getCellInfo(node);

  const mountRef = useRef<HTMLDivElement | undefined>();

  useEffect(() => {
    if (!frameBox || !mountBounds) {
      return;
    }
    setFrameScale(mountBounds.width / frameBox.width);
  }, [frameBox, mountBounds]);

  const onClick = useCallback(() => {
    const parts = url.parse(location.href, true);
    dispatch(
      redirectRequest({
        pathname: "/canvas",
        query: {
          ...parts.query,
          canvasFile: uri,
          frame: frameIndex,
          showAll: undefined,
        },
      })
    );
  }, [frameIndex, uri]);

  useEffect(() => {
    if (!mountRef.current) {
      // eslint-disable-next-line
      return () => {};
    }

    const onResize = throttle(() => {
      setMountBounds(mountRef.current.getBoundingClientRect());
    }, 100);

    onResize();

    window.addEventListener("resize", onResize);

    return () => {
      onResize.cancel();
      window.removeEventListener("resize", onResize);
    };
  }, [mountRef.current]);

  return {
    frameBox,
    scale,
    visible,
    label,
    onClick,
    mountRef,
  };
};

const getCellInfo = (node: VirtualFrame) => {
  const annotations: NodeAnnotations = node.annotations
    ? computeVirtScriptObject(node.annotations)
    : {};

  let label = "Untitled";

  let visible = true;

  if (annotations.frame) {
    if (annotations.frame.visible === false) {
      visible = false;
    }

    label = annotations.frame.title || label;
  }
  const tags = annotations.tags || [];

  return { label, visible, tags };
};
