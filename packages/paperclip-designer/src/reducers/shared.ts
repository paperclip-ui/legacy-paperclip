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
  editSharedDocuments,
  DesignerState
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
import { reduceDesigner } from "./designer";

const ZOOM_SENSITIVITY = IS_WINDOWS ? 2500 : 250;
const PAN_X_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const PAN_Y_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const MIN_ZOOM = 0.01;
const MAX_ZOOM = 6400 / 100;

export const sharedReducer = (state: AppState, action: Action) => {


  switch (action.type) {
    case ExternalActionType.CONTENT_CHANGED: {
      if (!state.shared.documents[action.payload.fileUri]) {
        return state;
      }
      return updateShared(state, {
        documents: produce(state.shared.documents, documents => {
          for (const {rangeOffset, rangeLength, text} of action.payload.changes) {
            const doc = documents[action.payload.fileUri];
            documents[action.payload.fileUri] = doc.substr(0, rangeOffset) + text + doc.substr(rangeOffset + rangeLength);
          }
        })
      });
    }
    case ActionType.PC_FILE_OPENED: {
      if (state.shared.documents[action.payload.uri]) {
        return state;
      }
      return updateShared(state, {
        documents: produce(state.shared.documents, documents => {
          documents[action.payload.uri] = action.payload.document;
        })
      });
    }
  }
  return state;
}

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
  { payload }: LocationChanged | RedirectRequested
) => {
  return produce(designer, newDesigner => {
    Object.assign(newDesigner.ui, payload);

    // clean path & ensure that it looks like "/canvas" instead of "/canvas/";
    newDesigner.ui.pathname = path
      .normalize(newDesigner.ui.pathname)
      .replace(/\/$/, "");

    newDesigner.centeredInitial = false;
  });
};
