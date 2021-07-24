import { throttle } from "lodash";
import { Point } from "../../state";

type DragProps = {
  delta: Point;
};

export function useDragger(onDrag: (props: DragProps) => any) {
  const onMouseDown = (event: React.MouseEvent<any>) => {
    const start = { x: event.screenX, y: event.screenY };

    const onMouseMove = throttle((event: any) => {
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
