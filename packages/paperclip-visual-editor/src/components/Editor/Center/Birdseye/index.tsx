import { Frame, FramesRenderer } from "paperclip-web-renderer";
import * as path from "path";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { render } from "react-dom";
import { useAppStore } from "../../../../hooks/useAppStore";
import { FrameContainer } from "../../../FrameContainer";
import * as styles from "./index.pc";
import { throttle, toUpper } from "lodash";
import * as url from "url";
import * as qs from "querystring";

import {
  VirtualElement,
  VirtualText,
  computeVirtJSObject,
  NodeAnnotations,
  VirtualNode,
  VirtualFrame
} from "paperclip-utils";
import { DEFAULT_FRAME_BOX } from "../../../../state";
import { useFrames, useMultipleFrames } from "../Canvas/Frames";
import { useTextInput } from "../../../TextInput";
import { relative } from "path";
import Spinner from "../../../Spinner/index.pc";
import { useHistory } from "react-router";

type CellFrame = {
  filePath: string;
  fileUri: string;
  index: number;
  relativePath: string;
  node: VirtualFrame;
} & Frame;

export const Birdseye = memo(() => {
  const { state, dispatch } = useAppStore();
  const [filter, setFilter] = useState<string>();
  const renderers = useMultipleFrames({
    fileData: state.allLoadedPCFileData,
    shouldCollectRects: false
  });
  const now = Date.now();
  const allFrames: CellFrame[] = renderers.reduce((frames, renderer) => {
    const filePath = fileURLToPath(renderer.renderer.targetUri);
    const relativePath = path.relative(
      state.projectDirectory?.absolutePath,
      filePath
    );
    return [
      ...frames,
      ...renderer.renderer.immutableFrames.map((frame, i) => ({
        ...frame,
        index: i,
        relativePath,
        filePath,
        fileUri: renderer.renderer.targetUri,
        node: (renderer.renderer.getPreview() as any).children[i]
      }))
    ];
  }, []);

  let content;

  if (state.loadingBirdseye) {
    content = <Spinner />;
  } else {
    content = (
      <>
        <Header filter={filter} onFilter={setFilter} />
        <styles.Cells>
          {allFrames.map(frame => {
            return (
              <Cell
                uri={frame.fileUri}
                index={frame.index}
                filter={filter}
                key={frame.fileUri + "-" + frame.index}
                dispatch={dispatch}
                frame={frame}
                relativePath={frame.relativePath}
                node={frame.node}
              />
            );
          })}
        </styles.Cells>
      </>
    );
  }

  return <styles.Container>{content}</styles.Container>;
});

type HeaderProps = {
  filter: string;
  onFilter: (value: string) => void;
};

const Header = memo(({ filter, onFilter }: HeaderProps) => {
  const { inputProps: filterInputProps } = useTextInput({
    value: filter,
    onValueChange: onFilter
  });
  return (
    <styles.Header>
      <styles.Filter
        filterInputRef={filterInputProps.ref}
        onChange={filterInputProps.onChange}
      />
    </styles.Header>
  );
});

type PCFileCellsProps = {
  filter?: string;
  uri: string;
  renderProtocol: string;
  projectPath: string;
  dispatch: any;
};
const PCFileCells = ({
  filter,
  uri,
  projectPath,
  dispatch
}: PCFileCellsProps) => {
  const filePath = fileURLToPath(uri);
  const { renderer } = useFrames({
    fileUri: uri,
    shouldCollectRects: false
  });

  const relativePath = path.relative(projectPath, filePath);
  return (
    <>
      {renderer.immutableFrames.map((frame, i) => {
        return (
          <Cell
            uri={uri}
            index={i}
            filter={filter}
            key={filePath + "-" + i}
            dispatch={dispatch}
            frame={frame}
            relativePath={relativePath}
            node={(renderer.getPreview() as any).children[i]}
          />
        );
      })}
    </>
  );
};

// builtin is null, so here's a hack
const fileURLToPath = (uri: string) => {
  return uri.replace("file://", "").replace(/\\/g, "/");
};

type CellProps = {
  filter?: string;
  uri: string;
  index: number;
  frame: Frame;
  node: VirtualText | VirtualElement;
  relativePath: string;
  dispatch: any;
};

const Cell = ({
  uri,
  index,
  filter,
  frame,
  node,
  relativePath,
  dispatch
}: CellProps) => {
  const { mountRef, label, frameBox, scale, onClick, visible } = useCell({
    uri,
    relativePath,
    filter,
    frameIndex: index,
    node
  });

  if (!visible) {
    return null;
  }

  return (
    <styles.Cell
      mountRef={mountRef}
      label={label}
      onMouseDown={onClick}
      dir={relativePath}
      controls={null}
    >
      <FrameContainer
        style={{
          width: frameBox.width,
          height: frameBox.height,
          transform: `scale(${scale})`,
          transformOrigin: `top left`
        }}
        frame={frame}
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

const useCell = ({
  filter,
  uri,
  frameIndex,
  relativePath,
  node
}: UseCellProps) => {
  const annotations: NodeAnnotations = node.annotations
    ? computeVirtJSObject(node.annotations)
    : {};
  const frameBox = useMemo(
    () => ({ ...DEFAULT_FRAME_BOX, ...annotations.frame }),
    [annotations]
  );

  const [mountBounds, setMountBounds] = useState<ClientRect | undefined>();
  const [scale, setFrameScale] = useState<number>(1);
  const history = useHistory();

  let label = "Untitled";

  const mountRef = useRef<HTMLDivElement | undefined>();

  useEffect(() => {
    if (!frameBox || !mountBounds) {
      return;
    }
    setFrameScale(mountBounds.width / frameBox.width);
  }, [frameBox, mountBounds]);

  const onClick = useCallback(() => {
    const parts = url.parse(location.href, true);
    history.push(
      "/canvas?" +
        qs.stringify({
          ...parts.query,
          current_file: uri,
          frame: frameIndex
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

  let visible = true;

  if (annotations.frame) {
    if (annotations.frame.visible === false) {
      visible = false;
    }

    label = annotations.frame.title || label;
  }

  const tags = annotations.tags || [];

  if (visible && filter) {
    // invisible until filter found
    const filterable: string[] = [label, relativePath, ...tags];

    visible = filter
      .toLowerCase()
      .trim()
      .split(" ")
      .every(filterPart => {
        for (const filterableItem of filterable) {
          if (filterableItem.toLowerCase().indexOf(filterPart) !== -1) {
            return true;
          }
        }
      });
  }

  return {
    frameBox,
    scale,
    visible,
    label,
    onClick,
    mountRef
  };
};
