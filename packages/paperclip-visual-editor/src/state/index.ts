import produce from "immer";
import { isEqual, pick, pickBy } from "lodash";
import {
  computeVirtJSObject,
  memoize,
  NodeAnnotations,
  VirtualFrame,
  VirtualNodeKind
} from "paperclip-utils";
import {
  VirtualNode,
  EngineErrorEvent,
  EngineDelegateEvent,
  LoadedData
} from "paperclip-utils";
import {
  Transform,
  Box,
  Point,
  Size,
  mergeBoxes,
  centerTransformZoom,
  getScaledPoint
} from "./geom";
import * as os from "os";
import { Frame } from "paperclip-web-renderer";

export const DEFAULT_FRAME_BOX = {
  width: 1024,
  height: 768,
  x: 0,
  y: 0
};

export type Canvas = {
  showTools: boolean;
  panning: boolean;
  transform: Transform;
  size: Size;
  scrollPosition: Point;
  mousePosition?: Point;
};

export type BoxNodeInfo = {
  nodePath: string;
  box: Box;
};

export enum FSItemKind {
  FILE = "file",
  DIRECTORY = "directory"
}

export type File = {
  kind: FSItemKind.FILE;
  absolutePath: string;
  url: string;
  name: string;
};

export type Directory = {
  name: string;
  kind: FSItemKind.DIRECTORY;
  absolutePath: string;
  url: string;
  children: Array<FSItem>;
};

export type FSItem = File | Directory;

type ExpandedFrameInfo = {
  frameIndex: number;
  previousCanvasTransform: Transform;
};

export type AppState = {
  id?: string;
  readonly: boolean;
  birdseyeFilter?: string;
  renderProtocol?: string;
  availableBrowsers?: AvailableBrowser[];
  centeredInitial: boolean;
  toolsLayerEnabled: boolean;
  currentError?: EngineErrorEvent;
  showBirdseye?: boolean;
  loadedBirdseyeInitially?: boolean;
  loadingBirdseye?: boolean;
  resizerMoving?: boolean;
  currentFileUri: string;
  locationQuery: Record<string, string>;
  embedded?: boolean;
  documentContent: Record<string, string>;
  mountedRendererIds: string[];
  currentEngineEvents: Record<string, EngineDelegateEvent[]>;
  allLoadedPCFileData: Record<string, LoadedData>;
  // rendererElement?: any;
  selectedNodePaths: string[];
  projectDirectory?: Directory;
  metaKeyDown?: boolean;
  canvas: Canvas;
  scrollSize?: Size;
  frameSize?: Size;
  boxes: Record<string, Box>;
  zoomLevel: number;
};

export enum EnvOptionKind {
  Public = "Public",
  Private = "Private",
  Browserstack = "Browserstack"
}

export type EnvOption = {
  kind: EnvOptionKind;
  launchOptions: any;
};

export type AvailableBrowser = {
  os: string;
  osVersion: string;
  browser: string;
  device: string;
  browserVersion: string;
};

export const INITIAL_STATE: AppState = {
  readonly: false,
  locationQuery: {},
  centeredInitial: false,
  mountedRendererIds: [],
  toolsLayerEnabled: true,
  documentContent: {},
  currentFileUri: null,
  availableBrowsers: [],
  currentEngineEvents: {},
  allLoadedPCFileData: {},
  boxes: {},
  zoomLevel: 1,
  selectedNodePaths: [],
  canvas: {
    panning: false,
    showTools: true,
    scrollPosition: { x: 0, y: 0 },
    size: { width: 0, height: 0 },
    mousePosition: null,
    transform: {
      x: 0,
      y: 0,
      z: 1
    }
  }
};

export const isExpanded = (state: AppState) => {
  return Boolean(state.locationQuery.expanded);
};

export const getActiveFrameIndex = (state: AppState) => {
  return state.locationQuery.frame && Number(state.locationQuery.frame);
};

export const IS_WINDOWS = os.platform() === "win32";

export const resetCanvas = (canvas: Canvas) => ({
  ...canvas,
  scrollPosition: { x: 0, y: 0 },
  transform: { x: 0, y: 0, z: 1 }
});

export const mergeBoxesFromClientRects = (
  boxes: Record<string, Box>,
  rects: Record<string, Box>
) => {
  const newBoxes = {};
  for (const nodePath in rects) {
    const { x, y, width, height } = rects[nodePath];
    const newBox = { x, y, width, height };
    const existingBox = boxes[nodePath];
    newBoxes[nodePath] = isEqual(existingBox, newBox) ? existingBox : newBox;
  }
  return newBoxes;
};

export const boxIntersectsPoint = (box: Box, point: Point) => {
  return (
    box.x <= point.x &&
    box.y <= point.y &&
    box.x + box.width >= point.x &&
    box.y + box.height >= point.y
  );
};

export const findBoxNodeInfo = memoize(
  (point: Point, boxes: Record<string, Box>): BoxNodeInfo | null => {
    let bestIntersetingBox;
    let bestIntersetingNodePath;
    for (const nodePath in boxes) {
      const box = boxes[nodePath];
      if (boxIntersectsPoint(box, point)) {
        if (
          !bestIntersetingBox ||
          nodePath.length > bestIntersetingNodePath.length
        ) {
          bestIntersetingBox = box;
          bestIntersetingNodePath = nodePath;
        }
      }
    }

    if (!bestIntersetingBox) {
      return null;
    }

    return {
      nodePath: bestIntersetingNodePath,
      box: bestIntersetingBox
    };
  }
);

export const calcFrameBox = memoize((rects: Record<string, Box>) => {
  let x = 0;
  let y = 0;
  let width = 0;
  let height = 0;

  for (const nodeId in rects) {
    const rect = rects[nodeId];
    x = Math.min(x, rect.x);
    y = Math.min(y, rect.y);
    width = Math.max(width, rect.width);
    height = Math.max(height, rect.height);
  }

  return {
    x,
    y,
    width,
    height
  };
});

export const getFSItem = (absolutePath: string, current: FSItem) => {
  if (current.absolutePath === absolutePath) {
    return current;
  }

  if (current.kind === FSItemKind.DIRECTORY) {
    for (const child of current.children) {
      const found = getFSItem(absolutePath, child);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

export const getSelectedFrames = (state: AppState): VirtualFrame[] => {
  return state.selectedNodePaths
    .map(nodePath => {
      const frameIndex = Number(nodePath);
      return getFrameFromIndex(frameIndex, state);
    })
    .filter(Boolean);
};

export const getFrameFromIndex = (
  frameIndex: number,
  state: AppState
): VirtualFrame => {
  if (!state.allLoadedPCFileData) {
    return null;
  }
  const preview = state.allLoadedPCFileData[state.currentFileUri]?.preview;
  if (!preview) {
    return null;
  }
  const frames =
    preview.kind == VirtualNodeKind.Fragment ? preview.children : [preview];
  return frames[frameIndex] as VirtualFrame;
};

export const getNodeInfoAtPoint = (
  point: Point,
  transform: Transform,
  boxes: Record<string, Box>,
  expandedFrameIndex?: number
) => {
  return findBoxNodeInfo(
    getScaledPoint(point, transform),
    expandedFrameIndex ? getFrameBoxes(boxes, expandedFrameIndex) : boxes
  );
};

export const getFrameBoxes = memoize(
  (boxes: Record<string, Box>, frameIndex: number) => {
    const v = pickBy(boxes, (value: Box, key: string) => {
      return key.indexOf(String(frameIndex)) === 0;
    });
    return v;
  }
);

export * from "./geom";

export const getPreviewChildren = (frame: VirtualNode) => {
  return frame.kind === VirtualNodeKind.Fragment ? frame.children : [frame];
};
const getPreviewFrameBoxes = (preview: VirtualNode) => {
  const currentPreview = preview;
  const frameBoxes = getPreviewChildren(currentPreview).map(
    (frame: VirtualFrame) => {
      const annotations =
        (frame.annotations &&
          (computeVirtJSObject(frame.annotations) as NodeAnnotations)) ||
        {};
      const box = annotations.frame || DEFAULT_FRAME_BOX;
      if (annotations.frame?.visible === false) {
        return null;
      }
      return { ...DEFAULT_FRAME_BOX, ...box };
    }
  );

  return frameBoxes;
};

const getAllFrameBounds = (state: AppState) => {
  return mergeBoxes(
    getPreviewFrameBoxes(
      state.allLoadedPCFileData[state.currentFileUri].preview
    ).filter(Boolean)
  );
};

const INITIAL_ZOOM_PADDING = 50;

/**
 * Called when file is data -- few conditions need to be met though:
 * canvas is loaded
 * file data is loaded
 */

export const maybeCenterCanvas = (state: AppState, force?: boolean) => {
  if (
    force ||
    (!state.centeredInitial &&
      state.allLoadedPCFileData[state.currentFileUri] &&
      state.canvas.size?.width &&
      state.canvas.size?.height)
  ) {
    state = produce(state, newState => {
      newState.centeredInitial = true;
    });

    let targetBounds: Box;
    const currentFrameIndex = getActiveFrameIndex(state);

    if (currentFrameIndex != null) {
      const frameBoxes = getPreviewFrameBoxes(
        state.allLoadedPCFileData[state.currentFileUri].preview
      );
      targetBounds = frameBoxes[currentFrameIndex];
    }

    state = centerEditorCanvas(state, targetBounds);

    return state;
  }
  return state;
};

// https://github.com/crcn/tandem/blob/10.0.0/packages/front-end/src/state/index.ts#L1304
export const centerEditorCanvas = (
  state: AppState,
  innerBounds?: Box,
  zoomOrZoomToFit: boolean | number = true
) => {
  if (!innerBounds) {
    innerBounds = getAllFrameBounds(state);
  }

  // no windows loaded
  if (
    innerBounds.x + innerBounds.y + innerBounds.width + innerBounds.height ===
    0
  ) {
    console.warn(` Cannot center when bounds has no size`);
    return state;
  }

  const {
    canvas: {
      transform,
      size: { width, height }
    }
  } = state;

  const centered = {
    x: -innerBounds.x + width / 2 - innerBounds.width / 2,
    y: -innerBounds.y + height / 2 - innerBounds.height / 2
  };

  const scale =
    typeof zoomOrZoomToFit === "boolean"
      ? Math.min(
          (width - INITIAL_ZOOM_PADDING) / innerBounds.width,
          (height - INITIAL_ZOOM_PADDING) / innerBounds.height
        )
      : typeof zoomOrZoomToFit === "number"
      ? zoomOrZoomToFit
      : transform.z;

  state = produce(state, newState => {
    newState.canvas.transform = centerTransformZoom(
      {
        ...centered,
        z: 1
      },
      {
        x: 0,
        y: 0,
        width,
        height
      },
      Math.min(scale, 1)
    );
  });

  return state;
};
