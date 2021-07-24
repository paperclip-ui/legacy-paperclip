import React, { MouseEvent, useEffect, useMemo, useState } from "react";
import { Point } from "../../state";
import * as styles from "./index.pc";
import { clamp, throttle } from "lodash";

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

  const { onMouseDown: onBarDown } = useDragger(({ delta }) => {
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
    <styles.default style={style} right={right} onBarDown={onBarDown}>
      {children}
    </styles.default>
  );
};

function useCache<TState>(
  id: string,
  initialValue: TState
): [TState, (value: TState) => void] {
  const localValue = useMemo(
    () => localStorage.getItem(id) && JSON.parse(localStorage.getItem(id)),
    []
  );

  const [value, _setValue] = useState<TState>(localValue || initialValue);

  const setValue = (value: TState) => {
    localStorage.setItem(id, JSON.stringify(value));
    _setValue(value);
  };

  return [value, setValue];
}

type DragProps = {
  delta: Point;
};

function useDragger(onDrag: (props: DragProps) => any) {
  const onMouseDown = (event: React.MouseEvent<any>) => {
    const start = { x: event.screenX, y: event.screenY };

    const onMouseMove = throttle((event: MouseEvent<any, any>) => {
      requestAnimationFrame(() => {
        onDrag({
          delta: { x: event.screenX - start.x, y: event.screenY - start.y }
        });
      });
    }, 30);

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove as any);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove as any);
    document.addEventListener("mouseup", onMouseUp);
  };

  return {
    onMouseDown
  };
}
