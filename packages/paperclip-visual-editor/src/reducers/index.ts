import {
  AppState,
  mergeBoxesFromClientRects,
  centerTransformZoom,
  IS_WINDOWS,
  Canvas,
  Box,
  resetCanvas,
  getFSItem,
  Directory
} from "../state";
import { produce } from "immer";
import { Action, ActionType } from "../actions";
import { clamp, isEqual } from "lodash";
import {
  EngineDelegateEventKind,
  patchVirtNode,
  updateAllLoadedData
} from "paperclip-utils";

const ZOOM_SENSITIVITY = IS_WINDOWS ? 2500 : 250;
const PAN_X_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const PAN_Y_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const MIN_ZOOM = 0.02;
const MAX_ZOOM = 6400 / 100;

export default (state: AppState, action: Action) => {
  switch (action.type) {
    // case ActionType.RENDERER_INITIALIZED: {
    //   return produce(state, newState => {
    //     newState.rendererElement = action.payload.element as any;
    //   });
    // }
    case ActionType.ENGINE_DELEGATE_CHANGED: {
      return produce(state, newState => {
        newState.currentEngineEvents.push(action.payload);
        newState.allLoadedPCFileData = updateAllLoadedData(
          newState.allLoadedPCFileData,
          action.payload
        );

        newState.currentError = undefined;
      });
    }
    case ActionType.CURRENT_FILE_INITIALIZED: {
      return produce(state, newState => {
        newState.allLoadedPCFileData[state.currentFileUri] = action.payload;
      });
    }
    case ActionType.ENGINE_DELEGATE_EVENTS_HANDLED: {
      return produce(state, newState => {
        newState.currentEngineEvents = [];
      });
    }
    case ActionType.FILE_OPENED: {
      return produce(state, newState => {
        newState.currentFileUri = action.payload.uri;
      });
    }
    case ActionType.RECTS_CAPTURED: {
      return produce(state, newState => {
        newState.boxes = mergeBoxesFromClientRects(
          newState.boxes,
          action.payload
        );
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
    case ActionType.PAINT_BUTTON_CLICKED: {
      return produce(state, newState => {
        newState.toolsLayerEnabled = !newState.toolsLayerEnabled;
        newState.selectedNodePath = null;
        newState.canvas = resetCanvas(newState.canvas);
      });
    }
    case ActionType.GLOBAL_ESCAPE_KEY_PRESSED: {
      // Don't do this until deselecting can be handled properly
      return produce(state, newState => {
        newState.selectedNodePath = null;
      });
    }
    case ActionType.GLOBAL_META_KEY_DOWN: {
      // TODO
      return produce(state, newState => {
        newState.metaKeyDown = true;
      });
    }
    case ActionType.GLOBAL_META_KEY_UP: {
      // TODO
      return produce(state, newState => {
        newState.metaKeyDown = false;
      });
    }
    case ActionType.CANVAS_ELEMENT_CLICKED: {
      // Don't do this until deselecting can be handled properly
      return produce(state, newState => {
        // allow toggle selecting elements - necessary since escape key doesn't work.
        newState.selectedNodePath =
          newState.selectedNodePath === action.payload.nodePath
            ? null
            : action.payload.nodePath;
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
        // if (
        //   !metaKey &&
        //   isEqual(newState.canvas.transform, state.canvas.transform)
        // ) {
        //   newState.canvas.scrollPosition.x = clamp(
        //     newState.canvas.scrollPosition.x + delta2X,
        //     0,
        //     newState.scrollSize.width - newState.frameSize.width
        //   );
        //   newState.canvas.scrollPosition.y = clamp(
        //     newState.canvas.scrollPosition.y + delta2Y,
        //     0,
        //     newState.scrollSize.height - newState.frameSize.height
        //   );
        // }
      });
    }
    case ActionType.CANVAS_MOUSE_MOVED: {
      return produce(state, newState => {
        newState.canvas.mousePosition = action.payload;
      });
    }
    case ActionType.DIR_LOADED: {
      return produce(state, newState => {
        if (action.payload.isRoot) {
          newState.projectDirectory = action.payload.item;
        } else {
          const target = getFSItem(
            action.payload.item.absolutePath,
            newState.projectDirectory
          );
          if (target) {
            (target as Directory).children = action.payload.item.children;
          }
        }
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
  return canvas;
  // return produce(canvas, newCanvas => {
  //   newCanvas.transform.x = clamp(
  //     newCanvas.transform.x,
  //     -(canvas.size.width * newCanvas.transform.z - canvas.size.width),
  //     0
  //   );
  //   newCanvas.transform.y = clamp(
  //     newCanvas.transform.y,
  //     -(canvas.size.height * newCanvas.transform.z - canvas.size.height),
  //     0
  //   );
  // });
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
