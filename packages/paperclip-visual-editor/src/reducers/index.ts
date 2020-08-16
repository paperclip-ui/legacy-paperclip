import {
  AppState,
  mergeBoxesFromClientRects,
  centerTransformZoom,
  IS_WINDOWS,
  Canvas,
  calcFrameBox,
  Box
} from "../state";
import { produce } from "immer";
import { Action, ActionType } from "../actions";
import { clamp, isEqual } from "lodash";

const ZOOM_SENSITIVITY = IS_WINDOWS ? 2500 : 250;
const PAN_X_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const PAN_Y_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const MIN_ZOOM = 1;
const MAX_ZOOM = 6400 / 100;

export default (state: AppState, action: Action) => {
  switch (action.type) {
    case ActionType.RENDERER_INITIALIZED: {
      return produce(state, newState => {
        newState.rendererElement = action.payload.element as any;
      });
    }
    case ActionType.RECTS_CAPTURED: {
      return produce(state, newState => {
        const { rects, frameSize, scrollSize } = action.payload;
        newState.currentError = null;
        newState.boxes = mergeBoxesFromClientRects(newState.boxes, rects);
        newState.frameSize = frameSize;
        newState.scrollSize = scrollSize;
      });
    }
    case ActionType.ENGINE_ERRORED: {
      return produce(state, newState => {
        newState.currentError = action.payload;
      });
    }
    case ActionType.ERROR_BANNER_CLICKED: {
      return produce(state, newState => {
        newState.currentError = null;
      });
    }
    case ActionType.ZOOM_IN_BUTTON_CLICKED: {
      return produce(state, newState => {
        newState.canvas = setCanvasZoom(
          normalizeZoom(state.canvas.transform.z) * 2,
          state.canvas,
          newState.boxes
        );
      });
    }
    case ActionType.ZOOM_OUT_BUTTON_CLICKED: {
      return produce(state, newState => {
        newState.canvas = setCanvasZoom(
          normalizeZoom(state.canvas.transform.z) / 2,
          state.canvas,
          newState.boxes
        );
      });
    }
    case ActionType.CANVAS_PAN_START: {
      return produce(state, newState => {
        newState.canvas.panning = true;
      });
    }
    case ActionType.CANVAS_PAN_END: {
      return produce(state, newState => {
        newState.canvas.panning = false;
      });
    }
    case ActionType.CANVAS_PANNED: {
      const {
        delta: { x: deltaX, y: deltaY },
        metaKey,
        mousePosition,
        size
      } = action.payload;

      const delta2X = deltaX * PAN_X_SENSITIVITY;
      const delta2Y = deltaY * PAN_Y_SENSITIVITY;

      return produce(state, newState => {
        const transform = newState.canvas.transform;

        if (metaKey) {
          newState.canvas.transform = centerTransformZoom(
            newState.canvas.transform,
            {
              x: 0,
              y: 0,
              width: size.width,
              height: size.height
            },
            clamp(
              transform.z + (transform.z * -deltaY) / ZOOM_SENSITIVITY,
              MIN_ZOOM,
              MAX_ZOOM
            ),
            mousePosition
          );
        } else {
          newState.canvas.transform.x = transform.x - delta2X; // clamp(transform.x - delta2X, 0, size.width * transform.z - size.width);
          newState.canvas.transform.y = transform.y - delta2Y; // clamp(transform.y - delta2Y, 0, size.height * transform.z - size.height);
        }
        Object.assign(
          newState.canvas,
          clampCanvasTransform(newState.canvas, newState.boxes)
        );

        // end of iframe bounds. Onto scrolling now. Note that this should only
        // work for full screen mode
        if (
          !metaKey &&
          isEqual(newState.canvas.transform, state.canvas.transform)
        ) {
          console.log(newState.frameSize, newState.scrollSize);
          newState.canvas.scrollPosition.x = clamp(
            newState.canvas.scrollPosition.x + delta2X,
            0,
            newState.scrollSize.width - newState.frameSize.width
          );
          newState.canvas.scrollPosition.y = clamp(
            newState.canvas.scrollPosition.y + delta2Y,
            0,
            newState.scrollSize.height - newState.frameSize.height
          );
        }
      });
    }
    case ActionType.CANVAS_MOUSE_MOVED: {
      return produce(state, newState => {
        newState.canvas.mousePosition = action.payload;
      });
    }
    case ActionType.CANVAS_RESIZED: {
      return produce(state, newState => {
        newState.canvas.size = action.payload;
      });
    }
    case ActionType.RENDERER_CHANGED: {
      return produce(state, newState => {
        newState.virtualRootNode = action.payload.virtualRoot;
      });
    }
  }
  return state;
};

const normalizeZoom = zoom => {
  return zoom < 1 ? 1 / Math.round(1 / zoom) : Math.round(zoom);
};

const clampCanvasTransform = (canvas: Canvas, rects: Record<string, Box>) => {
  return produce(canvas, newCanvas => {
    newCanvas.transform.x = clamp(
      newCanvas.transform.x,
      -(canvas.size.width * newCanvas.transform.z - canvas.size.width),
      0
    );
    newCanvas.transform.y = clamp(
      newCanvas.transform.y,
      -(canvas.size.height * newCanvas.transform.z - canvas.size.height),
      0
    );
  });
};

const setCanvasZoom = (
  zoom: number,
  state: Canvas,
  rects: Record<string, Box>
) => {
  zoom = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
  return clampCanvasTransform(
    produce(state, newState => {
      newState.transform = centerTransformZoom(
        state.transform,
        { x: 0, y: 0, ...state.size },
        zoom,
        state.mousePosition
      );
    }),
    rects
  );
};
