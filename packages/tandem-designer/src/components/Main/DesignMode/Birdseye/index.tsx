import * as path from "path";
import React, { memo, useCallback } from "react";
import { useAppStore } from "../../../../hooks/useAppStore";
import * as styles from "./index.pc";
import {
  computeVirtScriptObject,
  NodeAnnotations,
  VirtualFrame,
  EvaluatedDataKind,
  VirtualNodeKind,
} from "@paperclip-ui/utils";
import { useTextInput } from "@tandem-ui/design-system";
import { FilterTextInput } from "../../../TextInput/filter.pc";
import Spinner from "../../../Spinner/index.pc";
import { InfiniteScroller } from "../../../InfiniteScroller";
import { birdseyeFilterChanged } from "../../../../actions";
import { Cell } from "./Cell";

const DEFAULT_COLUMN_COUNT = 5;

type CellFrame = {
  fileUri: string;
  index: number;
  relativePath: string;
  node: VirtualFrame;
};

export const Birdseye = memo(() => {
  const { dispatch, state, onFilter, filteredCells, filter, columns } =
    useBirdseye();

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
              .map((frame) => {
                return (
                  <Cell
                    uri={frame.fileUri}
                    index={frame.index}
                    filter={filter}
                    key={frame.fileUri + "-" + frame.index}
                    dispatch={dispatch}
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
    if (data?.kind !== EvaluatedDataKind.PC) {
      continue;
    }
    const frames =
      data.preview.kind === VirtualNodeKind.Fragment
        ? data.preview.children
        : [data.preview];

    for (let i = 0, { length } = frames; i < length; i++) {
      const frame = frames[i];

      const filePath = fileURLToPath(uri);
      const relativePath =
        state.designer.projectDirectory &&
        path.relative(state.designer.projectDirectory?.absolutePath, filePath);

      allFrames.push({
        node: frame as VirtualFrame,
        index: i,
        relativePath,

        fileUri: uri,
      });
    }
  }

  const filteredCells = filterCells(allFrames, filter);

  const columns = DEFAULT_COLUMN_COUNT;

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
    columns,
  };
};

type HeaderProps = {
  filter: string;
  onFilter: (value: string) => void;
};

const Header = memo(({ filter, onFilter }: HeaderProps) => {
  const { inputProps: filterInputProps } = useTextInput({
    value: filter,
    onValueChange: onFilter,
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
  const filterParts = filter.toLowerCase().trim().split(" ");

  return cells.filter((cell) => {
    const info = getCellInfo(cell.node);

    let visible = info.visible;

    if (visible && filter) {
      // invisible until filter found
      const filterable: string[] = [
        info.label,
        cell.relativePath,
        ...info.tags,
      ];

      visible = filterParts.every((filterPart) => {
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
