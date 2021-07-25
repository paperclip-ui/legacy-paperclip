import React, { MouseEvent, useEffect, useMemo, useState } from "react";
import { Point } from "../../state";
import * as styles from "./index.pc";
import { clamp, throttle } from "lodash";
import { useDragger } from "../../hooks/useDragger";
import { useCache } from "../../hooks/useCache";

export type ResizableContainerProps = {
  id: string;
  defaultSize?: number;
  maxSize?: number;
  orientation: "left" | "right" | "top" | "bottom";
  children: any;
};

const DEFAULT_MAX_SIZE = 500;
const MIN_SIZE = 50;

export const ResizableContainer = ({
  id,
  defaultSize = 350,
  maxSize = DEFAULT_MAX_SIZE,
  orientation,
  children
}: ResizableContainerProps) => {
  const left = orientation === "left";
  const right = orientation === "right";
  const top = orientation === "top";
  const bottom = orientation === "bottom";

  const [size, setSize] = useCache(id, defaultSize);
  const setSize2 = (newSize: number) =>
    setSize(clamp(newSize, MIN_SIZE, maxSize));

  const { dragging, onMouseDown: onBarDown } = useDragger(({ delta }) => {
    if (right) {
      setSize2(size - delta.x);
    } else if (left) {
      setSize2(size + delta.x);
    } else if (top) {
      setSize2(size + delta.y);
    } else if (bottom) {
      setSize2(size - delta.y);
    }
  });

  const style = useMemo(() => {
    if (left || right) {
      return { width: size };
    } else {
      return { height: size };
    }
  }, [size]);

  return (
    <styles.default
      dragging={dragging}
      style={style}
      right={right}
      onBarDown={onBarDown}
    >
      {children}
    </styles.default>
  );
};
