import {
  AppState,
  mergeBoxesFromClientRects,
  centerTransformZoom,
  IS_WINDOWS,
  Canvas,
  Box,
  resetCanvas,
  getFSItem,
  Directory,
  maybeCenterCanvas,
  getNodeInfoAtPoint,
  getSelectedFrames,
  getFrameFromIndex,
  mergeBoxes
} from "../state";
import { produce } from "immer";
import { Action, ActionType } from "../actions";
import { clamp } from "lodash";
import {
  updateAllLoadedData,
  VirtualFrame,
  toVirtJsValue,
  computeVirtJSObject,
  VirtJsObjectKind,
  NodeAnnotations
} from "paperclip-utils";
import { actionCreator } from "../actions/base";
import { getFrameBounds } from "paperclip-web-renderer";

const ZOOM_SENSITIVITY = IS_WINDOWS ? 2500 : 250;
const PAN_X_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const PAN_Y_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const MIN_ZOOM = 0.02;
const MAX_ZOOM = 6400 / 100;

export default (state: AppState, action: Action) => {
  switch (action.type) {
    case ActionType.FRAME_TITLE_CLICKED: {
      return selectNode(
        String(action.payload.frameIndex),
        action.payload.shiftKey,
        state
      );
    }
    case ActionType.ENGINE_DELEGATE_CHANGED: {
      state = produce(state, newState => {
        newState.currentEngineEvents.push(action.payload);
        newState.allLoadedPCFileData = updateAllLoadedData(
          newState.allLoadedPCFileData,
          action.payload
        );

        newState.currentError = undefined;
      });

      state = maybeCenterCanvas(state);

      return state;
    }
    case ActionType.EXPAND_FRAME_BUTTON_CLICKED: {
      return produce(state, newState => {
        newState.expandedFrameInfo = {
          frameIndex: action.payload.frameIndex,
          previousCanvasTransform: state.canvas.transform
        };

        const frame = getFrameFromIndex(action.payload.frameIndex, state);
        const frameBounds = getFrameBounds(frame);

        newState.canvas.transform.x = -frameBounds.x;
        newState.canvas.transform.y = -frameBounds.y;
        newState.canvas.transform.z = 1;
      });
    }
    case ActionType.COLLAPSE_FRAME_BUTTON_CLICKED: {
      return produce(state, newState => {
        const transform = newState.expandedFrameInfo.previousCanvasTransform;
        newState.expandedFrameInfo = null;
        newState.canvas.transform = transform;
      });
    }
    case ActionType.CURRENT_FILE_INITIALIZED: {
      state = produce(state, newState => {
        newState.allLoadedPCFileData[state.currentFileUri] = action.payload;
      });
      state = maybeCenterCanvas(state);
      return state;
    }
    case ActionType.ENGINE_DELEGATE_EVENTS_HANDLED: {
      return produce(state, newState => {
        newState.currentEngineEvents.splice(0, action.payload.count);
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
        newState.selectedNodePaths = [];
      });
    }
    case ActionType.GLOBAL_BACKSPACE_KEY_SENT:
    case ActionType.GLOBAL_ESCAPE_KEY_PRESSED: {
      // Don't do this until deselecting can be handled properly
      return produce(state, newState => {
        newState.selectedNodePaths = [];
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
    case ActionType.CANVAS_MOUSE_UP: {
      if (state.resizerMoving) {
        return state;
      }
      // Don't do this until deselecting can be handled properly
      const nodePath = getNodeInfoAtPoint(
        state.canvas.mousePosition,
        state.canvas.transform,
        state.boxes,
        state.expandedFrameInfo?.frameIndex
      )?.nodePath;
      return selectNode(nodePath, action.payload.shiftKey, state);
    }
    case ActionType.DOCUMENT_CONTENT_CHANGED: {
      return produce(state, newState => {
        newState.documentContent[action.payload.uri] = action.payload.content;
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
    case ActionType.RESIZER_STOPPED_MOVING:
    case ActionType.RESIZER_PATH_MOUSE_STOPPED_MOVING: {
      return produce(state, newState => {
        newState.resizerMoving = false;
      });
    }
    case ActionType.RESIZER_MOVED:
    case ActionType.RESIZER_PATH_MOUSE_MOVED: {
      return produce(state, newState => {
        newState.resizerMoving = true;
        const frames = getSelectedFrames(newState);

        if (!frames.length) {
          console.warn(`Trying to resize non-frame`);
          return;
        }

        const oldBox = mergeBoxes(
          state.selectedNodePaths.map(nodePath => newState.boxes[nodePath])
        );

        for (let i = 0, { length } = state.selectedNodePaths; i < length; i++) {
          const frame = frames[i];
          const nodePath = state.selectedNodePaths[i];
          Object.assign(
            frame,
            updateAnnotations(frame, {
              frame: updateBox(
                newState.boxes[nodePath],
                oldBox,
                action.payload.newBounds
              )
            })
          );
        }
      });
    }
    case ActionType.GLOBAL_H_KEY_DOWN: {
      return produce(state, newState => {
        const frames = getSelectedFrames(newState);

        for (
          let i = 0, { length } = newState.selectedNodePaths;
          i < length;
          i++
        ) {
          const frame = frames[i];
          const annotations: NodeAnnotations =
            (frame.annotations && computeVirtJSObject(frame.annotations)) || {};
          Object.assign(
            frame,
            updateAnnotations(frame, {
              frame: {
                visible: !(annotations.frame?.visible !== false)
              }
            })
          );
        }
      });
    }
    case ActionType.FRAME_TITLE_CHANGED: {
      return produce(state, newState => {
        const frame = getFrameFromIndex(action.payload.frameIndex, newState);

        if (!frame) {
          console.warn(`Trying to resize non-frame`);
          return;
        }

        Object.assign(
          frame,
          updateAnnotations(frame, {
            frame: {
              title: action.payload.value
            }
          })
        );
      });

      return state;
    }
    case ActionType.CANVAS_PANNED: {
      // do not allow panning when expanded
      if (state.expandedFrameInfo) {
        return state;
      }

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
      state = produce(state, newState => {
        newState.canvas.size = action.payload;
      });

      state = maybeCenterCanvas(state);

      return state;
    }
  }
  return state;
};

const normalizeZoom = zoom => {
  return zoom < 1 ? 1 / Math.round(1 / zoom) : Math.round(zoom);
};

const clampCanvasTransform = (canvas: Canvas, rects: Record<string, Box>) => {
  return produce(canvas, newCanvas => {
    const w = (canvas.size.width / MIN_ZOOM) * canvas.transform.z;
    const h = (canvas.size.height / MIN_ZOOM) * canvas.transform.z;

    newCanvas.transform.x = clamp(newCanvas.transform.x, -w, w);

    newCanvas.transform.y = clamp(newCanvas.transform.y, -h, w);
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

const updateAnnotations = (frame: VirtualFrame, newAnnotations: any) => {
  const annotations =
    (frame.annotations && computeVirtJSObject(frame.annotations)) ||
    ({} as any);

  if (!frame.annotations) {
    frame.annotations = {
      kind: VirtJsObjectKind.JsObject,
      values: {},

      // null to indicate insertion
      source: null
    };
  }

  let mergedAnnotations = {};

  for (const key in newAnnotations) {
    mergedAnnotations = {
      ...mergedAnnotations,
      [key]: {
        ...(annotations[key] || {}),
        ...newAnnotations[key]
      }
    };
  }

  frame.annotations.values = toVirtJsValue(mergedAnnotations).values;
  return frame;
};

const selectNode = (nodePath: string, shiftKey: boolean, state: AppState) => {
  return produce(state, newState => {
    if (nodePath == null) {
      newState.selectedNodePaths = [];
      return;
    }
    if (shiftKey) {
      // allow toggle selecting elements - necessary since escape key doesn't work.
      newState.selectedNodePaths.push(nodePath);
    } else {
      newState.selectedNodePaths = [nodePath];
    }
  });
};

const updateBox = (box: Box, oldBox: Box, newBox: Box) => {
  const x = box.x + newBox.x - oldBox.x;
  const y = box.y + newBox.y - oldBox.y;
  const width = box.width + newBox.width - oldBox.width;
  const height = box.height + newBox.height - oldBox.height;
  return {
    x,
    y,
    width,
    height
  };
};
