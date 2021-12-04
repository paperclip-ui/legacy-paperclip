import React, { useMemo } from "react";
import * as styles from "./index.pc";
import { clamp } from "lodash";
import { useDragger } from "../../hooks/useDragger";
import { useCache } from "../../hooks/useCache";

export type ResizableContainerProps = {
  id: string;
  minSize?: number;
  defaultSize?: number;
  active?: boolean;
  scrollable?: boolean;
  maxSize?: number;
  orientation: "left" | "right" | "top" | "bottom";
  children: any;
};

const DEFAULT_MAX_SIZE = 500;
const MIN_SIZE = 50;

export const ResizableContainer = ({
  id,
  minSize = MIN_SIZE,
  defaultSize = 300,
  maxSize = DEFAULT_MAX_SIZE,
  scrollable,
  active = true,
  orientation,
  children,
}: ResizableContainerProps) => {
  const left = orientation === "left";
  const right = orientation === "right";
  const top = orientation === "top";
  const bottom = orientation === "bottom";

  const [size, setSize] = useCache(id, defaultSize);
  const setSize2 = (newSize: number) =>
    setSize(clamp(newSize, minSize, maxSize));

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
    if (!active) {
      return {};
    }

    if (left || right) {
      return { width: size };
    } else {
      return { height: size };
    }
  }, [active, size]);

  return (
    <styles.default
      disabled={!active}
      dragging={dragging}
      scrollable={scrollable}
      style={style}
      right={right}
      left={left}
      bottom={bottom}
      onBarDown={onBarDown}
    >
      {children}
    </styles.default>
  );
};
