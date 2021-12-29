import React, { forwardRef, useEffect, useState } from "react";
import { useDragger } from "../../../../hooks/useDragger";
import * as defaultStyles from "./index.pc";
import noop from "lodash/noop";

export type WindowResizerProps = {
  styles: Partial<typeof defaultStyles>;
  children: any;
  style?: any;
  onResizeStart?: () => void;
  onResizeStop?: () => void;
};

enum Track {
  HORIZONTAL = 1,
  VERTICAL = 2
}

const BARS = [
  "left",
  "right",
  "top",
  "bottom",
  "top left",
  "top right",
  "bottom left",
  "bottom right"
];

export const WindowResizer = forwardRef(
  (
    {
      children,
      style,
      onResizeStart = noop,
      onResizeStop = noop,
      styles = defaultStyles
    }: WindowResizerProps,
    ref: React.MutableRefObject<HTMLDivElement>
  ) => {
    styles = { ...defaultStyles, ...styles };

    const [internalStyle, setInternalStyle] = useState<any>({});
    const [resizing, setResizing] = useState(false);

    useEffect(() => {
      setInternalStyle({ ...internalStyle, ...style });
    }, [style]);

    const dragger = useDragger(
      (
        props,
        {
          pos,
          top,
          left,
          width,
          height
        }: {
          pos: string[];
          left: number;
          top: number;
          width: number;
          height: number;
        }
      ) => {
        if (pos.includes("left")) {
          width = width - props.delta.x;
          left = left + props.delta.x;
        }

        if (pos.includes("top")) {
          height = height - props.delta.y;
          top = top + props.delta.y;
        }

        if (pos.includes("right")) {
          width = width + props.delta.x;
        }

        if (pos.includes("bottom")) {
          height = height + props.delta.y;
        }

        if (left < 0) {
          left = 0;
        }

        if (top < 0) {
          top = 0;
        }

        if (left + width > window.innerWidth) {
          width = window.innerWidth - left;
        }

        if (top + height > window.innerHeight) {
          height = window.innerHeight - top;
        }

        setInternalStyle({
          ...internalStyle,
          top,
          left,
          width,
          height,
          maxHeight: "initial"
        });
      }
    );

    useEffect(() => {
      if (resizing !== dragger.dragging) {
        setResizing(dragger.dragging);
        if (dragger.dragging) {
          onResizeStart();
        } else {
          onResizeStop();
        }
      }
    }, [dragger.dragging, resizing]);

    return (
      <styles.Container ref={ref} style={internalStyle}>
        {children}
        {BARS.map(pos => {
          return (
            <div
              className={[
                styles.classNames.bar,
                ...pos.split(" ").map(part => styles.classNames[part])
              ].join(" ")}
              onMouseDown={event =>
                dragger.onMouseDown(event, {
                  pos,
                  top: ref.current.offsetTop,
                  left: ref.current.offsetLeft,
                  width: ref.current.offsetWidth,
                  height: ref.current.offsetHeight
                })
              }
            />
          );
        })}
      </styles.Container>
    );
  }
);
