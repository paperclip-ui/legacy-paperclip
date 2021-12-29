import { throttle } from "lodash";
import { useState } from "react";
import { Point } from "../../state";

type DragProps = {
  delta: Point;
};

export function useDragger(
  onDrag: (props: DragProps, initialState?: any) => any
) {
  const [dragging, setDragging] = useState(false);

  const onMouseDown = (event: React.MouseEvent<any>, initialState?: any) => {
    setDragging(true);
    const start = { x: event.screenX, y: event.screenY };

    const onMouseMove = throttle((event: any) => {
      requestAnimationFrame(() => {
        onDrag(
          {
            delta: { x: event.screenX - start.x, y: event.screenY - start.y }
          },
          initialState
        );
      });
    }, 30);

    const onMouseUp = () => {
      setDragging(false);
      document.removeEventListener("mousemove", onMouseMove as any);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove as any);
    document.addEventListener("mouseup", onMouseUp);
  };

  return {
    dragging,
    onMouseDown
  };
}
