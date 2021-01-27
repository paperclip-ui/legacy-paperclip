import {
  AppState,
  mergeBoxesFromClientRects,
  centerTransformZoom,
  IS_WINDOWS,
  Canvas,
  Box,
  getFSItem,
  Directory,
  maybeCenterCanvas,
  getNodeInfoAtPoint,
  getSelectedFrames,
  getFrameFromIndex,
  mergeBoxes,
  getActiveFrameIndex,
  isExpanded,
  getPreviewChildren,
  getCurrentPreviewFrameBoxes,
  updateShared,
  DesignerState,
  SyncLocationMode
} from "../state";
import { produce } from "immer";
import Automerge from "automerge";
import {
  Action,
  ActionType,
  ExternalActionType,
  LocationChanged,
  RedirectRequested,
  ServerActionType
} from "../actions";
import { clamp } from "lodash";
import {
  updateAllLoadedData,
  VirtualFrame,
  toVirtJsValue,
  computeVirtJSObject,
  VirtJsObjectKind,
  NodeAnnotations,
  isPaperclipFile,
  EngineDelegateEventKind
} from "paperclip-utils";
import * as path from "path";
import { actionCreator } from "../actions/base";

const ZOOM_SENSITIVITY = IS_WINDOWS ? 2500 : 250;
const PAN_X_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const PAN_Y_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const MIN_ZOOM = 0.01;
const MAX_ZOOM = 6400 / 100;

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
  rects: Record<string, Box>,
  centered?: boolean
) => {
  zoom = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
  return clampCanvasTransform(
    produce(state, newState => {
      newState.transform = centerTransformZoom(
        state.transform,
        { x: 0, y: 0, ...state.size },
        zoom,
        centered
          ? {
              x: state.size.width / 2,
              y: state.size.height / 2
            }
          : state.mousePosition
      );
    }),
    rects
  );
};

const updateAnnotations = (frame: VirtualFrame, newAnnotations: any) => {
  const annotations =
    (frame.annotations && computeVirtJSObject(frame.annotations)) ||
    ({} as any);

  let mergedAnnotations = {
    ...annotations
  };

  for (const key in newAnnotations) {
    mergedAnnotations = {
      ...mergedAnnotations,

      // simple merge - cover just objects, and replace all others.
      [key]:
        (typeof annotations[key] === typeof newAnnotations[key] &&
          typeof newAnnotations[key] === "object" &&
          !Array.isArray(newAnnotations) && {
            ...(annotations[key] || {}),
            ...newAnnotations[key]
          }) ||
        newAnnotations[key]
    };
  }

  if (!frame.annotations) {
    frame.annotations = {
      kind: VirtJsObjectKind.JsObject,
      values: {},

      // null to indicate insertion
      source: null
    };
  }

  frame.annotations.values = toVirtJsValue(mergedAnnotations).values;
  return frame;
};

const selectNode = (
  nodePath: string,
  shiftKey: boolean,
  designer: DesignerState
) => {
  return produce(designer, newDesigner => {
    if (nodePath == null) {
      newDesigner.selectedNodePaths = [];
      return;
    }
    if (shiftKey) {
      // allow toggle selecting elements - necessary since escape key doesn't work.
      newDesigner.selectedNodePaths.push(nodePath);
    } else {
      newDesigner.selectedNodePaths = [nodePath];
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

const minimizeWindow = (designer: DesignerState) => {
  if (!isExpanded(designer)) {
    return designer;
  }
  return maybeCenterCanvas(designer, true);
};

const handleLocationChange = (
  designer: DesignerState,
  { payload }: LocationChanged | RedirectRequested,
  mode: SyncLocationMode
) => {
  return produce(designer, newDesigner => {
    if (payload.query && mode & SyncLocationMode.Query) {
      newDesigner.ui.query = payload.query || {};
    }

    if (payload.pathname && mode & SyncLocationMode.Location) {
      const oldLocation = newDesigner.ui.pathname;
      newDesigner.ui.pathname = cleanupPath(payload.pathname);

      if (oldLocation !== newDesigner.ui.pathname) {
        newDesigner.centeredInitial = false;
      }
    }
  });
};

export const reduceDesigner = (
  designer: DesignerState,
  action: Action
): DesignerState => {
  switch (action.type) {
    case ActionType.FRAME_TITLE_CLICKED: {
      return selectNode(
        String(action.payload.frameIndex),
        action.payload.shiftKey,
        designer
      );
    }
    case ActionType.BIRDSEYE_FILTER_CHANGED: {
      return produce(designer, newDesigner => {
        newDesigner.birdseyeFilter = action.payload.value;
      });
    }
    case ServerActionType.INIT_PARAM_DEFINED: {
      return produce(designer, newDesigner => {
        newDesigner.readonly = action.payload.readonly;
        newDesigner.availableBrowsers = action.payload.availableBrowsers;
      });
    }
    case ServerActionType.BROWSERSTACK_BROWSERS_LOADED: {
      return produce(designer, newDesigner => {
        newDesigner.availableBrowsers = action.payload;
      });
    }
    case ActionType.LOCATION_CHANGED: {
      return handleLocationChange(designer, action, designer.syncLocationMode);
    }
    case ActionType.REDIRECT_REQUESTED: {
      return handleLocationChange(
        designer,
        action,
        SyncLocationMode.Location | SyncLocationMode.Query
      );
    }
    case ActionType.GET_ALL_SCREENS_REQUESTED: {
      return produce(designer, newDesigner => {
        newDesigner.showBirdseye = true;
        newDesigner.loadingBirdseye = true;
      });
    }
    case ActionType.RENDERER_MOUNTED: {
      return produce(designer, newDesigner => {
        newDesigner.mountedRendererIds.push(action.payload.id);
      });
    }
    case ActionType.RENDERER_UNMOUNTED: {
      return produce(designer, newDesigner => {
        newDesigner.mountedRendererIds.splice(
          newDesigner.mountedRendererIds.indexOf(action.payload.id),
          1
        );
        newDesigner.currentEngineEvents[action.payload.id] = undefined;
      });
    }
    case ActionType.ENGINE_DELEGATE_CHANGED: {
      // delete file
      if (action.payload.kind === EngineDelegateEventKind.Deleted) {
        designer = produce(designer, newDesigner => {
          delete newDesigner.allLoadedPCFileData[action.payload.uri];
        });

        return designer;
      }

      designer = produce(designer, newDesigner => {
        // if centered initially but there were no frames, then the canvas never really centered
        // so flag it do so now.
        if (
          designer.centeredInitial &&
          getCurrentPreviewFrameBoxes(designer).length === 0
        ) {
          newDesigner.centeredInitial = false;
        }

        if (action.payload.kind === EngineDelegateEventKind.Error) {
          newDesigner.currentError = action.payload;
        } else {
          newDesigner.currentError = undefined;
        }

        for (const id of newDesigner.mountedRendererIds) {
          if (!newDesigner.currentEngineEvents[id]) {
            newDesigner.currentEngineEvents[id] = [];
          }
          newDesigner.currentEngineEvents[id].push(action.payload);
        }
        newDesigner.allLoadedPCFileData = updateAllLoadedData(
          newDesigner.allLoadedPCFileData,
          action.payload
        );
      });

      designer = maybeCenterCanvas(designer);

      return designer;
    }
    // case ActionType.EXPAND_FRAME_BUTTON_CLICKED: {
    //   return produce(designer, newDesigner => {
    //     newDesigner.expandedFrameInfo = {
    //       frameIndex: action.payload.frameIndex,
    //       previousCanvasTransform: designer.canvas.transform
    //     };

    //     const frame = getFrameFromIndex(action.payload.frameIndex, designer);
    //     const frameBounds = getFrameBounds(frame);

    //     newDesigner.canvas.transform.x = -frameBounds.x;
    //     newDesigner.canvas.transform.y = -frameBounds.y;
    //     newDesigner.canvas.transform.z = 1;
    //   });
    // }
    case ActionType.COLLAPSE_FRAME_BUTTON_CLICKED: {
      return minimizeWindow(designer);
    }
    case ActionType.PC_FILE_OPENED: {
      designer = produce(designer, newDesigner => {
        newDesigner.allLoadedPCFileData[designer.ui.query.canvasFile] =
          action.payload.data;
      });
      designer = maybeCenterCanvas(designer);
      return designer;
    }
    case ActionType.ENGINE_DELEGATE_EVENTS_HANDLED: {
      return produce(designer, newDesigner => {
        newDesigner.currentEngineEvents[action.payload.id].splice(
          0,
          action.payload.count
        );
      });
    }
    case ActionType.FS_ITEM_CLICKED: {
      designer = produce(designer, newDesigner => {
        if (isPaperclipFile(action.payload.url)) {
          newDesigner.centeredInitial = false;
        }
      });
      return designer;
    }
    case ActionType.RECTS_CAPTURED: {
      return produce(designer, newDesigner => {
        newDesigner.boxes = mergeBoxesFromClientRects(
          newDesigner.boxes,
          action.payload
        );
      });
    }
    case ActionType.ENGINE_ERRORED: {
      return produce(designer, newDesigner => {
        newDesigner.currentError = action.payload;
      });
    }
    case ActionType.ERROR_BANNER_CLICKED: {
      return produce(designer, newDesigner => {
        newDesigner.currentError = null;
      });
    }
    case ActionType.GLOBAL_BACKSPACE_KEY_SENT:
    case ActionType.GLOBAL_ESCAPE_KEY_PRESSED: {
      // Don't do this until deselecting can be handled properly
      return produce(designer, newDesigner => {
        newDesigner.selectedNodePaths = [];
        newDesigner.showBirdseye = false;
      });
    }
    case ActionType.GLOBAL_META_KEY_DOWN: {
      // TODO
      return produce(designer, newDesigner => {
        newDesigner.metaKeyDown = true;
      });
    }
    case ActionType.GLOBAL_META_KEY_UP: {
      // TODO
      return produce(designer, newDesigner => {
        newDesigner.metaKeyDown = false;
      });
    }
    case ActionType.GLOBAL_OPTION_KEY_DOWN: {
      // TODO
      return produce(designer, newDesigner => {
        newDesigner.optionKeyDown = true;
      });
    }
    case ActionType.GLOBAL_OPTION_KEY_UP: {
      // TODO
      return produce(designer, newDesigner => {
        newDesigner.optionKeyDown = false;
      });
    }
    case ActionType.CANVAS_MOUSE_UP: {
      if (designer.resizerMoving) {
        return designer;
      }
      if (!designer.canvas.transform.x) {
        return designer;
      }
      // Don't do this until deselecting can be handled properly
      const nodePath = getNodeInfoAtPoint(
        designer.canvas.mousePosition,
        designer.canvas.transform,
        designer.boxes,
        isExpanded(designer) ? getActiveFrameIndex(designer) : null
      )?.nodePath;
      return selectNode(nodePath, action.payload.shiftKey, designer);
    }
    case ActionType.ZOOM_INPUT_CHANGED: {
      return produce(designer, newDesigner => {
        newDesigner.canvas = setCanvasZoom(
          action.payload.value / 100,
          designer.canvas,
          newDesigner.boxes,
          true
        );
      });
    }
    case ActionType.ZOOM_IN_KEY_PRESSED:
    case ActionType.ZOOM_IN_BUTTON_CLICKED: {
      return produce(designer, newDesigner => {
        newDesigner.canvas = setCanvasZoom(
          normalizeZoom(designer.canvas.transform.z) * 2,
          designer.canvas,
          newDesigner.boxes
        );
      });
    }
    case ActionType.ZOOM_OUT_KEY_PRESSED:
    case ActionType.ZOOM_OUT_BUTTON_CLICKED: {
      return produce(designer, newDesigner => {
        newDesigner.canvas = setCanvasZoom(
          normalizeZoom(designer.canvas.transform.z) / 2,
          designer.canvas,
          newDesigner.boxes
        );
      });
    }
    case ActionType.CANVAS_PAN_START: {
      return produce(designer, newDesigner => {
        newDesigner.canvas.panning = true;
      });
    }
    case ActionType.CANVAS_PAN_END: {
      return produce(designer, newDesigner => {
        newDesigner.canvas.panning = false;
      });
    }
    case ActionType.RESIZER_STOPPED_MOVING:
    case ActionType.RESIZER_PATH_MOUSE_STOPPED_MOVING: {
      return produce(designer, newDesigner => {
        newDesigner.resizerMoving = false;
      });
    }
    case ActionType.BIRDSEYE_TOP_FILTER_BLURRED:
    case ActionType.GRID_BUTTON_CLICKED:
    case ActionType.GRID_HOTKEY_PRESSED: {
      return produce(designer, newDesigner => {
        newDesigner.showBirdseye = !newDesigner.showBirdseye;
        if (newDesigner.showBirdseye && !newDesigner.loadedBirdseyeInitially) {
          newDesigner.loadingBirdseye = true;
        }
      });
    }

    // happens when grid view is requested
    case ServerActionType.ALL_PC_CONTENT_LOADED: {
      return produce(designer, newDesigner => {
        newDesigner.loadingBirdseye = false;
        newDesigner.loadedBirdseyeInitially = true;
        newDesigner.allLoadedPCFileData = action.payload;
      });
    }
    case ActionType.RESIZER_MOVED:
    case ActionType.RESIZER_PATH_MOUSE_MOVED: {
      return produce(designer, newDesigner => {
        newDesigner.resizerMoving = true;
        const frames = getSelectedFrames(newDesigner);

        if (!frames.length) {
          console.warn(`Trying to resize non-frame`);
          return;
        }

        const oldBox = mergeBoxes(
          designer.selectedNodePaths.map(
            nodePath => newDesigner.boxes[nodePath]
          )
        );

        for (
          let i = 0, { length } = designer.selectedNodePaths;
          i < length;
          i++
        ) {
          const frame = frames[i];
          const nodePath = designer.selectedNodePaths[i];
          Object.assign(
            frame,
            updateAnnotations(frame, {
              frame: updateBox(
                newDesigner.boxes[nodePath],
                oldBox,
                action.payload.newBounds
              )
            })
          );
        }
      });
    }
    case ActionType.GLOBAL_H_KEY_DOWN: {
      return produce(designer, newDesigner => {
        const frames = getSelectedFrames(newDesigner);

        for (
          let i = 0, { length } = newDesigner.selectedNodePaths;
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
      return produce(designer, newDesigner => {
        const frame = getFrameFromIndex(action.payload.frameIndex, newDesigner);

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
    }
    case ActionType.CANVAS_PANNED: {
      // do not allow panning when expanded
      if (isExpanded(designer)) {
        return designer;
      }

      const {
        delta: { x: deltaX, y: deltaY },
        metaKey,
        mousePosition,
        size
      } = action.payload;

      const delta2X = deltaX * PAN_X_SENSITIVITY;
      const delta2Y = deltaY * PAN_Y_SENSITIVITY;

      return produce(designer, newDesigner => {
        const transform = newDesigner.canvas.transform;

        if (metaKey) {
          newDesigner.canvas.transform = centerTransformZoom(
            newDesigner.canvas.transform,
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
          newDesigner.canvas.transform.x = transform.x - delta2X; // clamp(transform.x - delta2X, 0, size.width * transform.z - size.width);
          newDesigner.canvas.transform.y = transform.y - delta2Y; // clamp(transform.y - delta2Y, 0, size.height * transform.z - size.height);
        }
        Object.assign(
          newDesigner.canvas,
          clampCanvasTransform(newDesigner.canvas, newDesigner.boxes)
        );
      });
    }
    case ActionType.CANVAS_MOUSE_MOVED: {
      return produce(designer, newDesigner => {
        newDesigner.canvas.mousePosition = action.payload;
      });
    }
    case ActionType.DIR_LOADED: {
      return produce(designer, newDesigner => {
        if (action.payload.isRoot) {
          newDesigner.projectDirectory = action.payload.item;
        } else {
          const target = getFSItem(
            action.payload.item.absolutePath,
            newDesigner.projectDirectory
          );
          if (target) {
            (target as Directory).children = action.payload.item.children;
          }
        }
      });
    }
    case ActionType.CANVAS_RESIZED: {
      designer = produce(designer, newDesigner => {
        newDesigner.canvas.size = action.payload;
      });

      designer = maybeCenterCanvas(designer);

      return designer;
    }
  }

  return designer;
};

const cleanupPath = (pathname: string) =>
  path.normalize(pathname).replace(/\/$/, "");
