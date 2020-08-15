import React, { useState, useEffect } from "react";
import { Box, Point, findIntersectingBox } from "../../../../state";
import { useAppStore } from "../../../../hooks/useAppStore";
type Props = {
  boxes: Record<string, Box>;
};
import * as styles from "./index.pc";
import { Selectable } from "./Selectable";
export const Tools = () => {
  const {
    state: { boxes },
    dispatch
  } = useAppStore();
  const [mousePoint, setMousePoint] = useState<Point>(null);

  const onMouseMove = (event: React.MouseEvent<any>) => {
    setMousePoint({ x: event.pageX, y: event.pageY });
  };

  const onMouseLeave = () => setMousePoint(null);

  return (
    <styles.Tools onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <Selectable
        dispatch={dispatch}
        intersectingRect={mousePoint && findIntersectingBox(mousePoint, boxes)}
      />
    </styles.Tools>
  );
};
