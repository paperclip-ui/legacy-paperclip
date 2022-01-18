import { Frame, FramesRenderer, patchFrame } from "@paperclip-ui/web-renderer";
import * as path from "path";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useAppStore } from "../../../../hooks/useAppStore";
import { FrameContainer, useFrameContainer } from "../../../FrameContainer";
import * as styles from "./index.pc";
import { memoize, omitBy, throttle } from "lodash";
import * as url from "url";
import * as qs from "querystring";

import {
  VirtualElement,
  VirtualText,
  computeVirtScriptObject,
  NodeAnnotations,
  VirtualNode,
  VirtualFrame,
  LoadedData,
  EvaluatedDataKind,
  LoadedPCData,
  VirtualNodeKind
} from "@paperclip-ui/utils";
import { DEFAULT_FRAME_BOX } from "../../../../state";
import { useMultipleFrames } from "../Canvas/Frames";
import { useTextInput } from "@tandem-ui/design-system";
import { FilterTextInput } from "../../../TextInput/filter.pc";
import { renderFrame } from "@paperclip-ui/web-renderer";
import Spinner from "../../../Spinner/index.pc";
import { InfiniteScroller } from "../../../InfiniteScroller";
import { birdseyeFilterChanged, redirectRequest } from "../../../../actions";
import { useAllPaperclipDocuments } from "../../../../hocs/workspace";
import { useFrameUrlResolver } from "../../../../hooks/useFrameUrlResolver";

type CellFrame = {
  filePath: string;
  fileUri: string;
  index: number;
  relativePath: string;
  data: LoadedPCData;
  node: VirtualFrame;
};

export const Birdseye = memo(() => {
  const {
    dispatch,
    state,
    onFilter,
    filteredCells,
    filter,
    columns
  } = useBirdseye();

  let content;

  if (state.designer.loadingBirdseye) {
    content = <Spinner />;
  } else {
    content = (
      <>
        <Header filter={filter} onFilter={onFilter} />

        <InfiniteScroller
          size={Math.ceil(filteredCells.length / columns)}
          itemHeight={166}
          haveMinHeight={false}
          minVerticalItems={3}
        >
          {(cursor, maxRows) => {
            const start = cursor * columns;

            return filteredCells
              .slice(start, start + maxRows * columns)
              .map(frame => {
                return (
                  <Cell
                    uri={frame.fileUri}
                    index={frame.index}
                    filter={filter}
                    key={frame.fileUri + "-" + frame.index}
                    dispatch={dispatch}
                    fileContent={frame.data}
                    node={frame.node}
                    relativePath={frame.relativePath}
                  />
                );
              });
          }}
        </InfiniteScroller>
      </>
    );
  }

  return <styles.Container>{content}</styles.Container>;
});

const useBirdseye = () => {
  const { state, dispatch } = useAppStore();
  const filter = state.designer.birdseyeFilter;

  const allFrames: CellFrame[] = [];

  for (const uri in state.designer.allLoadedPCFileData) {
    if (!state.designer.projectDirectory) {
      continue;
    }

    const data = state.designer.allLoadedPCFileData[uri];
    if (data.kind !== EvaluatedDataKind.PC) {
      continue;
    }
    const frames =
      data.preview.kind === VirtualNodeKind.Fragment
        ? data.preview.children
        : [data.preview];

    for (let i = 0, { length } = frames; i < length; i++) {
      const frame = frames[i];

      const filePath = fileURLToPath(uri);
      const relativePath = path.relative(
        state.designer.projectDirectory?.absolutePath,
        filePath
      );

      allFrames.push({
        node: frame as VirtualFrame,
        index: i,
        relativePath,
        data,
        filePath,
        fileUri: uri
      });
    }
  }

  const filteredCells = filterCells(allFrames, filter);

  const columns = 5;

  const onFilter = useCallback(
    (value: string) => {
      dispatch(birdseyeFilterChanged({ value }));
    },
    [dispatch]
  );

  return {
    dispatch,
    state,
    onFilter,
    filteredCells,
    filter,
    columns
  };
};

type HeaderProps = {
  filter: string;
  onFilter: (value: string) => void;
};

const Header = memo(({ filter, onFilter }: HeaderProps) => {
  const { inputProps: filterInputProps } = useTextInput({
    value: filter,
    onValueChange: onFilter
  });

  // don't autofocus
  return (
    <styles.Header>
      <FilterTextInput
        filterInputRef={filterInputProps.ref}
        {...filterInputProps}
        autoFocus={false}
      />
    </styles.Header>
  );
});

// builtin is null, so here's a hack
const fileURLToPath = (uri: string) => {
  return uri.replace("file://", "").replace(/\\/g, "/");
};

type CellProps = {
  filter?: string;
  uri: string;
  index: number;
  fileContent: LoadedPCData;
  node: VirtualFrame;
  relativePath: string;
  dispatch: any;
};

const Cell = ({
  uri,
  index,
  filter,
  node,
  relativePath,
  fileContent,
  dispatch
}: CellProps) => {
  const { mountRef, label, frameBox, scale, onClick } = useCell({
    uri,
    relativePath,
    filter,
    frameIndex: index,
    node
  });

  const [state, setState] = useState<{
    uri: string;
    index: number;
    fileContent: LoadedPCData;
    stage: HTMLElement;
  }>();

  const resolveUrl = useFrameUrlResolver();

  useEffect(() => {
    let stage;
    if (state?.stage && uri === state.uri && index === state.index) {
      stage = state.stage;
      patchFrame(state.stage, index, state.fileContent, fileContent, {
        domFactory: document,
        resolveUrl
      });
    } else {
      stage = renderFrame(fileContent, index, {
        domFactory: document,
        resolveUrl
      });
    }
    setState({ stage, uri, index, fileContent });
  }, [uri, index, fileContent]);

  const { ref } = useFrameContainer({
    content: state?.stage
  });

  return (
    <styles.Cell
      mountRef={mountRef}
      label={label}
      onClick={onClick}
      dir={relativePath}
      controls={null}
    >
      <div style={{ width: "100%", height: "100%" }} ref={ref} />
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
          showAll: undefined
        }
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
    mountRef
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

const filterCells = (cells: CellFrame[], filter = "") => {
  const filterParts = filter
    .toLowerCase()
    .trim()
    .split(" ");

  return cells.filter(cell => {
    const info = getCellInfo(cell.node);

    let visible = info.visible;

    if (visible && filter) {
      // invisible until filter found
      const filterable: string[] = [
        info.label,
        cell.relativePath,
        ...info.tags
      ];

      visible = filterParts.every(filterPart => {
        for (const filterableItem of filterable) {
          if (filterableItem.toLowerCase().indexOf(filterPart) !== -1) {
            return true;
          }
        }
      });
    }

    return visible;
  });
};

const getPCFileData = memoize(
  (data: Record<string, LoadedData>): Record<string, LoadedPCData> => {
    return omitBy(data, value => {
      return value.kind != EvaluatedDataKind.PC;
    }) as Record<string, LoadedPCData>;
  }
);
