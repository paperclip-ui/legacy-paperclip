import produce from "immer";
import { isEqual, omit, omitBy, pick, pickBy } from "lodash";
import mime from "mime-types";
import {
  computeVirtScriptObject,
  ExprSource,
  getNodeAncestors,
  getNodeByPath,
  getNodePath,
  getTreeNodeMap,
  isInstance,
  isNodeParent,
  LoadedPCData,
  memoize,
  NodeAnnotations,
  nodePathToAry,
  NodeStyleInspection,
  VirtualFrame,
  VirtualNodeKind,
} from "@paperclip-ui/utils";
import {
  VirtualNode,
  EngineErrorEvent,
  EngineDelegateEvent,
  LoadedData,
} from "@paperclip-ui/utils";
import {
  Transform,
  Box,
  Point,
  Size,
  mergeBoxes,
  centerTransformZoom,
  getScaledPoint,
} from "./geom";
import * as os from "os";
import { Result } from "./result";
import { AvailableNode } from "@paperclip-ui/language-service";

// 2 MB
export const MAX_FILE_SIZE = 2 * 1000 * 1000;

export const EDITABLE_MIME_TYPES = ["text/plain", "image/svg+xml", "text/css"];
declare const DESIGNER_STATE: EmbeddedState | null;

const ALT_MIME_TYPES = [
  "application/vnd.ms-fontobject", // .eot
  "font/ttf",
  "font/woff",
  "font/woff2",
  "application/font-woff",
  "application/font-ttf",
  "application/font-woff2",
];

const MEDIA_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/svg+xml",
  "video/quicktime",
  "video/mp4",
];
const PREVIEW_MIME_TYPES = [...MEDIA_MIME_TYPES, "text/plain", "image/svg+xml"];

const ACCEPTED_MIME_TYPES = [
  ...ALT_MIME_TYPES,
  ...MEDIA_MIME_TYPES,
  ...EDITABLE_MIME_TYPES,
];

export const DEFAULT_FRAME_BOX = {
  width: 1024,
  height: 768,
  x: 0,
  y: 0,
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
  DIRECTORY = "directory",
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

export type UIStateQuery = {
  showAll: boolean;
  canvasFile: string;
  projectId?: string;
  id: string;
  expanded: boolean;
  frame: number;
  embedded: boolean;
};

export type EmbeddedState = {
  host: string;
} & UIStateQuery;

export type UIState = {
  query: Partial<UIStateQuery>;
};

// aut

export type Project = {
  name: string;
  documents: Record<string, string>;
};

// state that can be synchronized between documents
export type SharedState = {
  documents: Record<string, string | Blob>;
};

export enum SyncLocationMode {
  None = 0,
  Query = 1,
  Location = 1 << 1,
}

export type BranchInfo = {
  currentBranch: string;
  branches: string[];
  branchable: boolean;
};

export type WorkspaceState = {
  canvasFile?: string;
  showFullEditor?: boolean;
  localResourceRoots: string[];
  branchInfo: BranchInfo;
};

export type VirtualNodeSourceInfo = {
  virtualNodePath: number[];
  source: ExprSource;
};
export type DesignerState = {
  syncLocationMode?: number;
  canvasClickTimestamp?: number;
  showCodeEditorOnStartup?: boolean;
  floatingPreview?: boolean;
  ui: UIState;
  readonly: boolean;
  currentCodeFile?: string;
  sharable: boolean;
  useLiteEditor: boolean;
  birdseyeFilter?: string;
  centeredInitial: boolean;
  toolsLayerEnabled: boolean;
  workspace?: WorkspaceState;
  commitProjectStatus?: Result<undefined>;
  currentError?: EngineErrorEvent;
  showBirdseye?: boolean;
  showCodeToolbar?: boolean;
  showLeftSidebar?: boolean;
  rounded?: boolean;
  showInspectorPanels?: boolean;
  loadedBirdseyeInitially?: boolean;
  loadingBirdseye?: boolean;
  resizerMoving?: boolean;

  currentEngineEvents: Record<string, EngineDelegateEvent[]>;
  allLoadedPCFileData: Record<string, LoadedData>;
  loadingInsertableNodes: boolean;
  showInsertModal: boolean;
  draggingInsertableNode: AvailableNode;
  insertableNodes: AvailableNode[];
  pcFileDataVersion: number;
  // rendererElement?: any;
  availableBrowsers: AvailableBrowser[];
  resourceHost: string;
  codeEditorWidth?: string;
  highlightNodePath: string;
  scopedElementPath?: string;
  selectedNodePaths: string[];
  showTextEditor: boolean;
  expandedNodePaths: string[];
  expandedFilePaths: string[];
  selectedNodeSources: VirtualNodeSourceInfo[];
  selectedNodeStyleInspections: NodeStyleInspection[];
  projectDirectory?: Directory;
  metaKeyDown?: boolean;
  optionKeyDown?: boolean;
  canvas: Canvas;
  scrollSize?: Size;
  frameSize?: Size;
  frameBoxes: Record<string, Record<string, Box>>;
  zoomLevel: number;
};

export type HistState = {
  shared: SharedState;
  history: {
    past: SharedState[];
    future: SharedState[];
  };
};

type ActionShape = {
  type: string;
  payload: any;
};

export type AppState = {
  // state that can be hooked up with CRDTs
  actions: ActionShape[];
  shared: SharedState;
  designer: DesignerState;
  compact?: boolean;
} & HistState;

export enum EnvOptionKind {
  Public = "Public",
  Private = "Private",
  Browserstack = "Browserstack",
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

const host =
  typeof DESIGNER_STATE === "undefined"
    ? window.location.host
    : DESIGNER_STATE.host;
export const INITIAL_STATE: AppState = {
  actions: [],
  history: {
    past: [],
    future: [],
  },
  shared: {
    documents: {},
  },
  designer: {
    insertableNodes: [],
    draggingInsertableNode: null,
    loadingInsertableNodes: false,
    useLiteEditor: false,
    showInsertModal: false,
    showTextEditor: false,
    readonly: false,
    pcFileDataVersion: 0,
    selectedNodeSources: [],
    selectedNodeStyleInspections: [],
    expandedNodePaths: [],
    expandedFilePaths: [],
    syncLocationMode: SyncLocationMode.Location | SyncLocationMode.Query,
    sharable: true,
    ui: {
      query: {},
    },
    highlightNodePath: null,
    centeredInitial: false,
    toolsLayerEnabled: true,
    resourceHost:
      typeof window !== "undefined" ? "http://" + host + "/file/" : null,
    availableBrowsers: [],
    currentEngineEvents: {},
    allLoadedPCFileData: {},
    frameBoxes: {},
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
        z: 1,
      },
    },
  },
};

export const flattenFrameBoxes = memoize(
  (frameBoxes: Record<string, Record<string, Box>>) => {
    const all = {};
    for (const id in frameBoxes) {
      Object.assign(all, frameBoxes[id]);
    }
    return all;
  }
);

export const isExpanded = (designer: DesignerState) => {
  return Boolean(designer.ui.query.expanded);
};

export const getActiveFrameIndex = (designer: DesignerState) => {
  return designer.ui.query.frame && Number(designer.ui.query.frame);
};

export const IS_WINDOWS = os.platform() === "win32";

export const resetCanvas = (canvas: Canvas) => ({
  ...canvas,
  scrollPosition: { x: 0, y: 0 },
  transform: { x: 0, y: 0, z: 1 },
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
      box: bestIntersetingBox,
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
    height,
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

export const getSelectedFrames = (designer: DesignerState): VirtualFrame[] => {
  return designer.selectedNodePaths
    .map((nodePath) => {
      const frameIndex = Number(nodePath);
      return getFrameFromIndex(frameIndex, designer);
    })
    .filter(Boolean);
};

export const getFrameFromIndex = (
  frameIndex: number,
  designer: DesignerState
): VirtualFrame => {
  if (!designer.allLoadedPCFileData) {
    return null;
  }
  const preview = (
    designer.allLoadedPCFileData[designer.ui.query.canvasFile] as LoadedPCData
  )?.preview;
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

export const getScopedBoxes = memoize(
  (
    boxes: Record<string, Box>,
    scopedElementPath: string,
    root: VirtualNode
  ) => {
    const hoverableNodePaths = getHoverableNodePaths(scopedElementPath, root);

    return pick(boxes, hoverableNodePaths);
  }
);

const getHoverableNodePaths = memoize(
  (scopedNodePath: string | undefined, root: VirtualNode) => {
    const scopedNode = scopedNodePath
      ? getNodeByPath(scopedNodePath, root)
      : root;
    const ancestors = scopedNodePath
      ? getNodeAncestors(scopedNodePath, root)
      : [];

    const hoverable: VirtualNode[] = [];

    const scopes = [scopedNode, ...ancestors];

    for (const scope of scopes) {
      addHoverableChildren(scope, true, hoverable);
    }

    return hoverable.map((node) => getNodePath(node, root));
  }
);

export const shouldShowQuickfind = (state: AppState) =>
  state.designer.showInsertModal;
export const getInsertableNodes = (state: AppState) =>
  state.designer.insertableNodes;

const addHoverableChildren = (
  node: VirtualNode,
  isScope: boolean,
  hoverable: VirtualNode[]
) => {
  if (!hoverable.includes(node)) {
    hoverable.push(node);
  }

  if (isInstance(node) && !isScope) {
    return;
  }

  if (isNodeParent(node)) {
    for (const child of node.children) {
      addHoverableChildren(child, false, hoverable);
    }
  }
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
          (computeVirtScriptObject(frame.annotations) as NodeAnnotations)) ||
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

export const getCurrentPreview = (designer: DesignerState) => {
  const currentPCData = designer.allLoadedPCFileData[
    designer.ui.query?.canvasFile
  ] as LoadedPCData;
  return currentPCData?.preview;
};

export const getCurrentPreviewFrameBoxes = (designer: DesignerState) => {
  const preview = getCurrentPreview(designer);

  return preview ? getPreviewFrameBoxes(preview).filter(Boolean) : [];
};

export const getNewFilePath = (name: string, previousNameOrExt: string) => {
  const ext = previousNameOrExt
    ? previousNameOrExt.split(".").pop()
    : name.includes(".")
    ? name.split(".").pop()
    : "pc";

  return cleanupPath(name.replace(/\.\w+$/, "") + "." + ext);
};
export const canUpload = (files: FileList) => {
  return Array.from(files).every((file) => {
    if (file.size > MAX_FILE_SIZE) {
      return false;
    }

    return ACCEPTED_MIME_TYPES.includes(
      file.type || String(mime.lookup(file.name))
    );
  });
};

const getAllFrameBounds = (designer: DesignerState) => {
  return mergeBoxes(getCurrentPreviewFrameBoxes(designer));
};

const INITIAL_ZOOM_PADDING = 50;

/**
 * Called when file is data -- few conditions need to be met though:
 * canvas is loaded
 * file data is loaded
 */

export const maybeCenterCanvas = (designer: DesignerState, force?: boolean) => {
  if (
    force ||
    (!designer.centeredInitial &&
      designer.allLoadedPCFileData[designer.ui.query.canvasFile] &&
      designer.canvas.size?.width &&
      designer.canvas.size?.height)
  ) {
    designer = produce(designer, (newDesigner) => {
      newDesigner.centeredInitial = true;
    });

    let targetBounds: Box;
    const currentFrameIndex = getActiveFrameIndex(designer);

    if (currentFrameIndex != null) {
      const frameBoxes = getPreviewFrameBoxes(
        (
          designer.allLoadedPCFileData[
            designer.ui.query.canvasFile
          ] as LoadedPCData
        ).preview
      );
      targetBounds = frameBoxes[currentFrameIndex];
    }

    designer = centerEditorCanvas(designer, targetBounds);

    return designer;
  }
  return designer;
};

export const updateShared = (state: AppState, shared: Partial<SharedState>) => {
  return {
    ...state,
    shared: {
      ...state.shared,
      ...shared,
    },
  };
};

// https://github.com/crcn/tandem/blob/10.0.0/packages/dashboard/src/state/index.ts#L1304
export const centerEditorCanvas = (
  designer: DesignerState,
  innerBounds?: Box,
  zoomOrZoomToFit: boolean | number = true
) => {
  if (!innerBounds) {
    innerBounds = getAllFrameBounds(designer);
  }

  // no windows loaded
  if (
    innerBounds.x + innerBounds.y + innerBounds.width + innerBounds.height ===
    0
  ) {
    console.warn(` Cannot center when bounds has no size`);
    return designer;
  }

  const {
    canvas: {
      transform,
      size: { width, height },
    },
  } = designer;

  const centered = {
    x: -innerBounds.x + width / 2 - innerBounds.width / 2,
    y: -innerBounds.y + height / 2 - innerBounds.height / 2,
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

  designer = produce(designer, (newDesigner) => {
    newDesigner.canvas.transform = centerTransformZoom(
      {
        ...centered,
        z: 1,
      },
      {
        x: 0,
        y: 0,
        width,
        height,
      },
      Math.min(scale, 1)
    );
  });

  return designer;
};
export const cleanupPath = (path: string) => {
  // just rel directory - no root defined
  return path.replace(/\w+:\/\//, "").replace(/\/+/, "/");
};

export const getActivePCData = (designer: DesignerState) =>
  designer.allLoadedPCFileData[
    designer.ui.query.canvasFile
  ] as any as LoadedPCData;

export const getAppActivePCData = (state: AppState) =>
  getActivePCData(state.designer);
export const getSelectedNodePaths = (state: AppState) =>
  state.designer.selectedNodePaths;

export const getInspectionInfo = (state: AppState) =>
  state.designer.selectedNodeStyleInspections;

export const pruneDeletedNodes = (designer: DesignerState) => {
  return produce(designer, (newDesigner) => {
    const pruneAry = (ary: string[]) => {
      let pruned = false;
      for (let i = ary.length; i--; ) {
        const nodePath = ary[i];
        if (!getNodeByPath(nodePath, activePCData?.preview)) {
          pruned = true;
          ary.splice(i, 1);
        }
      }
      return pruned;
    };

    const activePCData = getActivePCData(newDesigner);
    if (pruneAry(newDesigner.selectedNodePaths)) {
      newDesigner.selectedNodeStyleInspections = [];
      newDesigner.selectedNodeSources = [];
    }
    pruneAry(newDesigner.expandedNodePaths);

    if (
      newDesigner.scopedElementPath &&
      !getNodeByPath(newDesigner.scopedElementPath, activePCData.preview)
    ) {
      newDesigner.scopedElementPath = undefined;
    }
  });
};

export const getBranchInfo = (state: AppState) =>
  state.designer.workspace?.branchInfo;

export const getCommitStatus = (state: AppState) =>
  state.designer.commitProjectStatus;
