import React from "react";
import * as defaultStyles from "./index.pc";

export type WindowResizerProps = {
  styles: Partial<typeof defaultStyles>;
  children: any;
  style?: any;
};

enum Track {
  HORIZONTAL = 1,
  VERTICAL = 2
}

export const WindowResizer = ({
  children,
  style,
  styles = defaultStyles
}: WindowResizerProps) => {
  styles = { ...defaultStyles, ...styles };

  const bars = {
    left: Track.HORIZONTAL,
    right: Track.HORIZONTAL,
    top: Track.VERTICAL,
    bottom: Track.VERTICAL,
    "top left": Track.HORIZONTAL | Track.VERTICAL,
    "top right": Track.HORIZONTAL | Track.VERTICAL,
    "bottom left": Track.HORIZONTAL | Track.VERTICAL,
    "bottom right": Track.HORIZONTAL | Track.VERTICAL
  };

  const onDown = pos => {};

  return (
    <styles.Container style={style}>
      {children}
      {Object.keys(bars).map(pos => {
        return (
          <div
            className={[
              styles.classNames.bar,
              ...pos.split(" ").map(part => styles.classNames[part])
            ].join(" ")}
            onMouseDown={onDown.bind(this, pos)}
          />
        );
      })}
    </styles.Container>
  );
};
