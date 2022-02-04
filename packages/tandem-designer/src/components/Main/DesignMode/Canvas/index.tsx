import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import * as styles from "./index.pc";
import { Tools } from "./Tools";
import { useAppStore } from "../../../../hooks/useAppStore";
import { Frames } from "./Frames";
import { normalizeWheel } from "./normalize-wheel";
import {
  canvasPanEnd,
  canvasPanned,
  canvasPanStart,
  canvasResized,
} from "../../../../actions";
import {
  getActiveFrameIndex,
  getFrameFromIndex,
  isExpanded,
} from "../../../../state";
import { getFrameBounds } from "@paperclip-ui/web-renderer";

export const Canvas = React.memo(() => {
  const { canvasRef, actualTransform, expanded, state } = useCanvas();

  return (
    <styles.Canvas ref={canvasRef}>
      <styles.Inner
        style={{
          transform: `translateX(${actualTransform.x}px) translateY(${actualTransform.y}px) scale(${actualTransform.z}) translateZ(0)`,
          transformOrigin: "top left",
        }}
      >
        <Frames
          expandedFrameIndex={
            expanded ? getActiveFrameIndex(state.designer) : null
          }
        />
      </styles.Inner>
      <Tools />
    </styles.Canvas>
  );
});

const useCanvas = () => {
  const { state, dispatch } = useAppStore();
  const {
    designer: {
      canvas: { transform },
    },
  } = state;

  const expanded = isExpanded(state.designer);

  const actualTransform = useMemo(() => {
    if (expanded) {
      const frame = getFrameFromIndex(
        getActiveFrameIndex(state.designer),
        state.designer
      );
      if (!frame) {
        return transform;
      }
      const frameBounds = frame && getFrameBounds(frame);
      return {
        x: -frameBounds.x,
        y: -frameBounds.y,
        z: 1,
      };
    } else {
      return transform;
    }
  }, [transform, expanded]);

  const [canvasPanTimer, setCanvasPanTimer] = useState<any>(0);

  const canvasRef = useRef<HTMLElement>();

  const onWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      clearTimeout(canvasPanTimer);

      let { pixelX, pixelY } = normalizeWheel(event);
      if (!canvasRef.current) {
        return;
      }
      if (!canvasPanTimer) {
        dispatch(canvasPanStart(null));
      }
      const rect = canvasRef.current.getBoundingClientRect();

      // ignore jerky scroll - happens in VM for some reason.
      if (Math.abs(pixelX) > 100) {
        pixelX = pixelX / 100;
      }

      dispatch(
        canvasPanned({
          delta: {
            x: pixelX,
            y: pixelY,
          },
          mousePosition: {
            x: event.pageX - window.scrollX - rect.left,
            y: event.pageY - window.scrollY - rect.top,
          },
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          size: {
            width: rect.width,
            height: rect.height,
          },
        })
      );
      setCanvasPanTimer(
        setTimeout(() => {
          setCanvasPanTimer(null);
          dispatch(canvasPanEnd(null));
        }, 100)
      );

      return false;
    },
    [canvasRef, dispatch, setCanvasPanTimer]
  );

  useEffect(() => {
    const ref = canvasRef.current;
    if (!ref) {
      return;
    }

    const onResize = () => {
      const { width, height } = ref.getBoundingClientRect();
      dispatch(
        canvasResized({
          width,
          height,
        })
      );
    };
    const obs = new ResizeObserver(onResize);
    obs.observe(ref);

    ref.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);

    requestAnimationFrame(onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      obs.disconnect();
      ref.removeEventListener("wheel", onWheel);
    };
  }, [canvasRef]);

  return { canvasRef, actualTransform, expanded, state };
};
