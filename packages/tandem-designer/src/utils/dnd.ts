import { throttle } from "lodash";

export const startDOMDrag = (
  startEvent: any,
  onStart: (event?: MouseEvent) => any,
  update: (
    event: MouseEvent,
    data?: { delta?: { x: number; y: number } }
  ) => any,
  stop: any = undefined
) => {
  const sx = startEvent.clientX;
  const sy = startEvent.clientY;
  const doc = startEvent.target.ownerDocument;

  let _animating: boolean;
  let _started: boolean;

  // slight delay to prevent accidental drag from firing
  // if the user does some other mouse interaction such as a double click.
  const drag = throttle((event) => {
    if (!_started) {
      _started = true;
      onStart && onStart(event);
    }
    event.preventDefault();
    update(event, {
      delta: {
        x: event.clientX - sx,
        y: event.clientY - sy,
      },
    });
  }, 10);

  function onMouseUp(event) {
    doc.removeEventListener("mousemove", drag);
    doc.removeEventListener("mouseup", onMouseUp);
    if (stop && _started) {
      stop(event, {
        delta: {
          x: event.clientX - sx,
          y: event.clientY - sy,
        },
      });
    }
  }

  doc.addEventListener("mousemove", drag);
  doc.addEventListener("mouseup", onMouseUp);
};
