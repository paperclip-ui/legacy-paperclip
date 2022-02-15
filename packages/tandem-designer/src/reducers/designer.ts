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
  getCurrentPreviewFrameBoxes,
  DesignerState,
  SyncLocationMode,
  pruneDeletedNodes,
  getActivePCData,
  getScopedBoxes,
  Point,
  FSItemKind,
  flattenFrameBoxes,
  getCurrentPreview,
  getScaledPoint,
} from "../state";
import { produce } from "immer";
import { compare, applyPatch } from "fast-json-patch";
import {
  Action,
  ActionType,
  CanvasMouseDown,
  mainActions,
  workspaceActions,
  RedirectRequested,
  ServerActionType,
} from "../actions";
import { clamp, pick, without } from "lodash";
import {
  updateAllLoadedData,
  VirtualFrame,
  toVirtScriptValue,
  computeVirtScriptObject,
  VirtScriptObjectKind,
  NodeAnnotations,
  isPaperclipFile,
  EngineDelegateEventKind,
  getInstanceAncestor,
  BasicPaperclipActionType,
  LoadedPCData,
  getNodePath,
  nodePathToAry,
  getNodeByPath,
  getNodeAncestors,
  isInstance,
  stripFileProtocol,
  VirtualNodeKind,
  VirtualElement,
  VirtualFragment,
} from "@paperclip-ui/utils";
import * as path from "path";
import { uiActions } from "../actions/ui-actions";
import { AvailableNodeKind } from "@paperclip-ui/language-service";

const ZOOM_SENSITIVITY = IS_WINDOWS ? 2500 : 250;
const PAN_X_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const PAN_Y_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const MIN_ZOOM = 0.01;
const MAX_ZOOM = 6400 / 100;
const DOUBLE_CLICK_MS = 250;

const normalizeZoom = (zoom) => {
  return zoom < 1 ? 1 / Math.round(1 / zoom) : Math.round(zoom);
};

const clampCanvasTransform = (canvas: Canvas, rects: Record<string, Box>) => {
  return produce(canvas, (newCanvas) => {
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
    produce(state, (newState) => {
      newState.transform = centerTransformZoom(
        state.transform,
        { x: 0, y: 0, ...state.size },
        zoom,
        centered
          ? {
              x: state.size.width / 2,
              y: state.size.height / 2,
            }
          : state.mousePosition
      );
    }),
    rects
  );
};

const updateAnnotations = (frame: VirtualFrame, newAnnotations: any) => {
  const annotations =
    (frame.annotations && computeVirtScriptObject(frame.annotations)) ||
    ({} as any);

  let mergedAnnotations = {
    ...annotations,
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
            ...newAnnotations[key],
          }) ||
        newAnnotations[key],
    };
  }

  if (!frame.annotations) {
    frame.annotations = {
      kind: VirtScriptObjectKind.Object,
      values: {},

      // null to indicate insertion
      sourceId: null,
    };
  }

  frame.annotations.values = toVirtScriptValue(mergedAnnotations).values;
  return frame;
};

const selectNode = (
  nodePath: string,
  shiftKey: boolean,
  metaKey: boolean,
  designer: DesignerState
) => {
  designer = produce(designer, (newDesigner) => {
    newDesigner.selectedNodeStyleInspections = [];
    newDesigner.selectedNodeSources = [];

    if (nodePath == null) {
      newDesigner.selectedNodePaths = [];
      newDesigner.scopedElementPath = null;
      return;
    }
    if (shiftKey) {
      // allow toggle selecting elements - necessary since escape key doesn't work.
      newDesigner.selectedNodePaths.push(nodePath);
    } else {
      newDesigner.selectedNodePaths = [nodePath];
    }

    if (
      newDesigner.scopedElementPath &&
      !nodePath.startsWith(newDesigner.scopedElementPath)
    ) {
      const preview = getActivePCData(newDesigner).preview;
      const node = getNodeByPath(nodePath, preview);
      const instanceAncestor = getInstanceAncestor(node, preview);
      newDesigner.scopedElementPath =
        instanceAncestor && getNodePath(instanceAncestor, preview);
    }
  });

  if (nodePath) {
    designer = expandNode(nodePath, designer);
  }

  return designer;
};

const expandNode = (nodePath: string, designer: DesignerState) => {
  const nodePathAry = nodePathToAry(nodePath);
  return produce(designer, (newDesigner) => {
    // can't be empty, so start at 1
    for (let i = 1, { length } = nodePathAry; i <= length; i++) {
      const ancestorPath = nodePathAry.slice(0, i).join(".");
      if (!newDesigner.expandedNodePaths.includes(ancestorPath)) {
        newDesigner.expandedNodePaths.push(ancestorPath);
      }
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
    height,
  };
};

const minimizeWindow = (designer: DesignerState) => {
  if (!isExpanded(designer)) {
    return designer;
  }
  return maybeCenterCanvas(designer, true);
};

const expandFilePath = (newDesigner: DesignerState, oldCanvasFile: string) => {
  if (oldCanvasFile !== newDesigner.ui.query.canvasFile) {
    const abs = newDesigner.ui.query.canvasFile.replace("file://", "");
    const parts = abs.split("/");
    for (let i = 1, { length } = parts; i < length; i++) {
      const dir = parts.slice(0, i).join("/");
      if (!newDesigner.expandedFilePaths.includes(dir)) {
        newDesigner.expandedFilePaths.push(dir);
      }
    }
  }

  return newDesigner;
};

const handleLocationChange = (
  designer: DesignerState,
  {
    payload,
  }: ReturnType<typeof mainActions.locationChanged> | RedirectRequested,
  mode: SyncLocationMode
) => {
  const oldCanvasFile = designer.ui.query.canvasFile;
  const oldShowAll = designer.ui.query.showAll;
  designer = produce(designer, (newDesigner) => {
    if (payload.query && mode & SyncLocationMode.Query) {
      newDesigner.ui.query = {
        ...newDesigner.ui.query,
        ...(payload.query || {}),
      };
    }

    expandFilePath(newDesigner, oldCanvasFile);
  });

  if (
    designer.ui.query.canvasFile !== oldCanvasFile ||
    designer.ui.query.showAll !== oldShowAll
  ) {
    if (designer.canvas.size?.width) {
      designer = maybeCenterCanvas(designer, true);
    } else {
      designer = { ...designer, centeredInitial: false };
    }
  }

  return designer;
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
        false,
        designer
      );
    }
    case ActionType.LAYER_LEAF_CLICKED:
    case ActionType.NODE_BREADCRUMB_CLICKED: {
      if (action.payload.metaKey) {
        return designer;
      }

      return selectNode(action.payload.nodePath, false, false, designer);
    }
    case ActionType.LAYER_EXPAND_TOGGLE_CLICKED: {
      return produce(designer, (newDesigner) => {
        if (newDesigner.expandedNodePaths.includes(action.payload.nodePath)) {
          newDesigner.expandedNodePaths = without(
            newDesigner.expandedNodePaths,
            action.payload.nodePath
          );
        } else {
          newDesigner.expandedNodePaths.push(action.payload.nodePath);
        }
      });
    }
    case ActionType.NODE_BREADCRUMB_MOUSE_ENTERED: {
      return produce(designer, (newDesigner) => {
        newDesigner.highlightNodePath = action.payload.nodePath;
      });
    }
    case ActionType.NODE_BREADCRUMB_MOUSE_LEFT: {
      return produce(designer, (newDesigner) => {
        newDesigner.highlightNodePath = null;
      });
    }
    case ServerActionType.VIRTUAL_NODE_SOURCES_LOADED: {
      return produce(designer, (newDesigner) => {
        newDesigner.selectedNodeSources = action.payload;
      });
    }
    case ServerActionType.VIRTUAL_NODE_STYLES_INSPECTED: {
      const diff = compare(
        designer.selectedNodeStyleInspections,
        action.payload.map((info) => info[1])
      );

      return produce(designer, (newDesigner) => {
        newDesigner.selectedNodeStyleInspections = applyPatch(
          newDesigner.selectedNodeStyleInspections,
          diff
        ).newDocument;
      });
    }
    case ActionType.BIRDSEYE_FILTER_CHANGED: {
      return produce(designer, (newDesigner) => {
        newDesigner.birdseyeFilter = action.payload.value;
      });
    }
    case ServerActionType.INIT_PARAM_DEFINED: {
      return produce(designer, (newDesigner) => {
        newDesigner.readonly = action.payload.readonly;
        newDesigner.availableBrowsers = action.payload.availableBrowsers;
      });
    }
    case ServerActionType.BROWSERSTACK_BROWSERS_LOADED: {
      return produce(designer, (newDesigner) => {
        newDesigner.availableBrowsers = action.payload;
      });
    }
    case mainActions.locationChanged.type: {
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
      return produce(designer, (newDesigner) => {
        newDesigner.showBirdseye = true;
        newDesigner.loadingBirdseye = true;
      });
    }
    case ActionType.SYNC_PANELS_CLICKED: {
      return selectNode(null, false, false, designer);
    }
    case ActionType.COMMIT_REQUEST_STATE_CHANGED: {
      return produce(designer, (newDesigner) => {
        newDesigner.commitProjectStatus = action.payload.result;
      });
    }
    case ActionType.SET_BRANCH_REQUEST_STATE_CHANGE: {
      return produce(designer, (newDesigner) => {
        if (action.payload.result.loaded && !action.payload.result.error) {
          newDesigner.workspace.branchInfo.currentBranch =
            action.payload.result.data.branchName;
        }
      });
    }
    case workspaceActions.allFramesLoaded.type: {
      designer = produce(designer, (newDesigner) => {
        newDesigner.loadingBirdseye = false;
        newDesigner.allLoadedPCFileData = Object.keys(action.payload).reduce(
          (docs, docUri) => {
            docs[docUri] = action.payload[docUri];
            return docs;
          },
          {}
        );
      });
      designer = maybeCenterCanvas(designer);
      return designer;
    }
    case ActionType.GLOBAL_META_I_KEY_PRESS: {
      designer = produce(designer, (newDesigner) => {
        newDesigner.loadingInsertableNodes = false;
        newDesigner.showInsertModal = !newDesigner.showInsertModal;
      });
      return designer;
    }
    case workspaceActions.insertableNodesLoaded.type: {
      designer = produce(designer, (newDesigner) => {
        newDesigner.insertableNodes = action.payload;
        newDesigner.loadingInsertableNodes = false;
      });
      return designer;
    }
    case uiActions.quickfindItemStartDrag.type: {
      designer = produce(designer, (newDesigner) => {
        newDesigner.draggingInsertableNode = action.payload;
      });
      return designer;
    }
    case uiActions.documentMouseUp.type: {
      designer = produce(designer, (newDesigner) => {
        newDesigner.draggingInsertableNode = null;
        newDesigner.showInsertModal = false;
      });
      return designer;
    }
    case uiActions.toolLayerDrop.type: {
      designer = produce(designer, (newDesigner) => {
        newDesigner.draggingInsertableNode = null;
        newDesigner.showInsertModal = false;
        const root = (
          newDesigner.allLoadedPCFileData[
            newDesigner.ui.query.canvasFile
          ] as LoadedPCData
        ).preview as VirtualFragment;
        if (newDesigner.highlightNodePath) {
          const parent = getNodeByPath(
            newDesigner.highlightNodePath,
            root
          ) as any as VirtualElement;

          const lastChild = parent.children.length
            ? parent.children[parent.children.length - 1]
            : null;

          // If previous child is text, and dropped element is text, then they will be merged together, so
          // select the last child
          if (
            action.payload.node.kind === AvailableNodeKind.Text &&
            lastChild &&
            lastChild.kind === VirtualNodeKind.Text
          ) {
            newDesigner.selectedNodePaths = [
              newDesigner.highlightNodePath +
                "." +
                (parent.children.length - 1),
            ];
          } else {
            newDesigner.selectedNodePaths = [
              newDesigner.highlightNodePath + "." + parent.children.length,
            ];
          }
        } else {
          newDesigner.selectedNodePaths = [String(root.children.length)];
        }
        if (action.payload.node.kind === AvailableNodeKind.Text) {
          newDesigner.showTextEditor = true;
        }
      });
      return designer;
    }
    case workspaceActions.framesLoaded.type: {
      designer = produce(designer, (newDesigner) => {
        newDesigner.allLoadedPCFileData[action.payload.uri] =
          action.payload.content;
      });
      designer = maybeCenterCanvas(designer);
      return designer;
    }
    case workspaceActions.projectLoaded.type: {
      return produce(designer, (newDesigner) => {
        const { directoryUri, directoryPath } = action.payload;
        newDesigner.projectDirectory = {
          kind: FSItemKind.DIRECTORY,
          url: directoryUri,
          absolutePath: directoryPath,
          name: path.dirname(directoryPath),
          children: [],
        };
      });
    }
    case workspaceActions.pcContentUpdated.type: {
      designer = produce(designer, (newDesigner) => {
        newDesigner.allLoadedPCFileData[action.payload.uri] =
          action.payload.content;

        for (
          let i = 0, { length } = newDesigner.selectedNodePaths;
          i < length;
          i++
        ) {
          const node = getNodeByPath(
            newDesigner.selectedNodePaths[i],
            (
              newDesigner.allLoadedPCFileData[
                newDesigner.ui.query.canvasFile
              ] as LoadedPCData
            ).preview
          );

          if (!node) {
            newDesigner.selectedNodePaths.splice(i, 1);
            newDesigner.selectedNodeStyleInspections.splice(i, 1);
          }
        }
      });
      return designer;
    }
    case BasicPaperclipActionType.ENGINE_DELEGATE_CHANGED: {
      // delete file
      if (action.payload.kind === EngineDelegateEventKind.Deleted) {
        designer = produce(designer, (newDesigner) => {
          delete newDesigner.allLoadedPCFileData[action.payload.uri];
        });

        return designer;
      }

      designer = produce(designer, (newDesigner) => {
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

        newDesigner.allLoadedPCFileData = updateAllLoadedData(
          newDesigner.allLoadedPCFileData,
          action.payload
        );
      });

      designer = maybeCenterCanvas(designer);
      designer = pruneDeletedNodes(designer);

      return designer;
    }
    case ActionType.COLLAPSE_FRAME_BUTTON_CLICKED: {
      return minimizeWindow(designer);
    }
    case ActionType.FILE_ITEM_CLICKED: {
      return produce(designer, (newDesigner) => {
        newDesigner.currentCodeFile = action.payload.uri;
      });
    }
    case ActionType.SERVER_OPTIONS_LOADED: {
      return produce(designer, (newDesigner) => {
        newDesigner.workspace = action.payload;
        newDesigner.currentCodeFile = action.payload.canvasFile;
      });
    }
    case ActionType.FILE_LOADED: {
      if (isPaperclipFile(action.payload.uri)) {
        designer = produce(designer, (newDesigner) => {
          newDesigner.allLoadedPCFileData[action.payload.uri] = action.payload
            .data as LoadedPCData;
          newDesigner.pcFileDataVersion++;
        });
      }
      designer = maybeCenterCanvas(designer);
      designer = pruneDeletedNodes(designer);
      return designer;
    }
    case ActionType.ENGINE_DELEGATE_EVENTS_HANDLED: {
      return produce(designer, (newDesigner) => {
        newDesigner.currentEngineEvents[action.payload.id].splice(
          0,
          action.payload.count
        );
      });
    }
    case ActionType.FS_ITEM_CLICKED: {
      designer = produce(designer, (newDesigner) => {
        const i = newDesigner.expandedFilePaths.indexOf(
          action.payload.absolutePath
        );
        if (i === -1) {
          newDesigner.expandedFilePaths.push(action.payload.absolutePath);
        } else {
          newDesigner.expandedFilePaths.splice(i, 1);
        }

        if (isPaperclipFile(action.payload.url)) {
          newDesigner.centeredInitial = false;
        }
      });
      return designer;
    }
    case uiActions.canvasTextContentChanges.type: {
      return produce(designer, (newDesigner) => {
        newDesigner.showTextEditor = false;
      });
    }

    case ActionType.RECTS_CAPTURED: {
      designer = produce(designer, (newDesigner) => {
        newDesigner.frameBoxes[action.payload.frameIndex] =
          mergeBoxesFromClientRects(
            newDesigner.frameBoxes[action.payload.frameIndex] || {},
            action.payload.boxes
          );

        const preview = getCurrentPreview(newDesigner);

        // ensure that any old frames are removed
        newDesigner.frameBoxes = pick(
          newDesigner.frameBoxes,
          Array.from({
            length:
              preview.kind === VirtualNodeKind.Fragment
                ? preview.children.length
                : 0,
          }).map((v, i) => String(i))
        );
      });

      return designer;
    }
    case ActionType.ENGINE_ERRORED: {
      return produce(designer, (newDesigner) => {
        newDesigner.currentError = action.payload;
      });
    }
    case ActionType.ERROR_BANNER_CLICKED: {
      return produce(designer, (newDesigner) => {
        newDesigner.currentError = null;
      });
    }
    case ActionType.GLOBAL_BACKSPACE_KEY_SENT:
    case ActionType.GLOBAL_ESCAPE_KEY_PRESSED: {
      // Don't do this until deselecting can be handled properly
      return produce(designer, (newDesigner) => {
        newDesigner.selectedNodePaths = [];
        newDesigner.scopedElementPath = null;
        newDesigner.showBirdseye = false;
        newDesigner.showInsertModal = false;
      });
    }
    case ActionType.GLOBAL_META_KEY_DOWN: {
      // TODO
      return produce(designer, (newDesigner) => {
        newDesigner.metaKeyDown = true;
      });
    }
    case ActionType.GLOBAL_META_KEY_UP: {
      // TODO
      return produce(designer, (newDesigner) => {
        newDesigner.metaKeyDown = false;
      });
    }
    case ActionType.GLOBAL_OPTION_KEY_DOWN: {
      // TODO
      return produce(designer, (newDesigner) => {
        newDesigner.optionKeyDown = true;
      });
    }
    case ActionType.GLOBAL_OPTION_KEY_UP: {
      // TODO
      return produce(designer, (newDesigner) => {
        newDesigner.optionKeyDown = false;
      });
    }
    case ActionType.CANVAS_MOUSE_DOWN: {
      if (designer.resizerMoving) {
        return designer;
      }

      if (!designer.canvas.transform.x || !designer.canvas.mousePosition?.x) {
        return designer;
      }

      let doubleClicked;

      [designer, doubleClicked] = handleDoubleClick(designer, action);

      console.log(doubleClicked);

      if (doubleClicked) {
        if (designer.selectedNodePaths.length) {
          const node = getNodeByPath(
            designer.selectedNodePaths[0],
            getCurrentPreview(designer)
          );
          console.log(node);
          if (node && node.kind === VirtualNodeKind.Text) {
            designer = produce(designer, (newDesigner) => {
              newDesigner.showTextEditor = true;
            });
          }
        }
        return designer;
      }

      // Don't do this until deselecting can be handled properly
      const nodePath = getNodeInfoAtPoint(
        designer.canvas.mousePosition,
        designer.canvas.transform,
        getScopedBoxes(
          flattenFrameBoxes(designer.frameBoxes),
          designer.scopedElementPath,
          getActivePCData(designer).preview
        ),
        isExpanded(designer) ? getActiveFrameIndex(designer) : null
      )?.nodePath;

      return selectNode(
        nodePath,
        action.payload.shiftKey,
        action.payload.metaKey,
        designer
      );
    }
    case ActionType.ZOOM_INPUT_CHANGED: {
      return produce(designer, (newDesigner) => {
        newDesigner.canvas = setCanvasZoom(
          action.payload.value / 100,
          designer.canvas,
          flattenFrameBoxes(designer.frameBoxes),
          true
        );
      });
    }
    case ActionType.ZOOM_IN_KEY_PRESSED:
    case ActionType.ZOOM_IN_BUTTON_CLICKED: {
      return produce(designer, (newDesigner) => {
        newDesigner.canvas = setCanvasZoom(
          normalizeZoom(designer.canvas.transform.z) * 2,
          designer.canvas,
          flattenFrameBoxes(designer.frameBoxes)
        );
      });
    }
    case ActionType.ZOOM_OUT_KEY_PRESSED:
    case ActionType.ZOOM_OUT_BUTTON_CLICKED: {
      return produce(designer, (newDesigner) => {
        newDesigner.canvas = setCanvasZoom(
          normalizeZoom(designer.canvas.transform.z) / 2,
          designer.canvas,
          flattenFrameBoxes(designer.frameBoxes)
        );
      });
    }
    case ActionType.CANVAS_PAN_START: {
      return produce(designer, (newDesigner) => {
        newDesigner.canvas.panning = true;
      });
    }
    case ActionType.CANVAS_PAN_END: {
      return produce(designer, (newDesigner) => {
        newDesigner.canvas.panning = false;
      });
    }
    case ActionType.RESIZER_STOPPED_MOVING:
    case ActionType.RESIZER_PATH_MOUSE_STOPPED_MOVING: {
      return produce(designer, (newDesigner) => {
        newDesigner.resizerMoving = false;
      });
    }
    case ActionType.BIRDSEYE_TOP_FILTER_BLURRED:
    case ActionType.GRID_BUTTON_CLICKED:
    case ActionType.GRID_HOTKEY_PRESSED: {
      return produce(designer, (newDesigner) => {
        newDesigner.showBirdseye = !newDesigner.showBirdseye;
        if (newDesigner.showBirdseye && !newDesigner.loadedBirdseyeInitially) {
          newDesigner.loadingBirdseye = true;
        }
      });
    }

    // happens when grid view is requested
    case ServerActionType.ALL_PC_CONTENT_LOADED: {
      designer = produce(designer, (newDesigner) => {
        newDesigner.loadingBirdseye = false;
        newDesigner.loadedBirdseyeInitially = true;
        newDesigner.allLoadedPCFileData = action.payload;
        newDesigner.currentEngineEvents = {};

        // janky mechanism to reset renderer state since renderer depends on diffing  - we
        // need to explicitly version the data like so
        newDesigner.pcFileDataVersion++;
      });

      designer = pruneDeletedNodes(designer);
      return designer;
    }
    case ActionType.RESIZER_MOVED:
    case ActionType.RESIZER_PATH_MOUSE_MOVED: {
      return produce(designer, (newDesigner) => {
        newDesigner.resizerMoving = true;
        const frames = getSelectedFrames(newDesigner);

        if (!frames.length) {
          console.warn(`Trying to resize non-frame`);
          return;
        }

        const boxes = flattenFrameBoxes(newDesigner.frameBoxes);

        const oldBox = mergeBoxes(
          designer.selectedNodePaths.map((nodePath) => boxes[nodePath])
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
                boxes[nodePath],
                oldBox,
                action.payload.newBounds
              ),
            })
          );
        }
      });
    }
    case ActionType.GLOBAL_H_KEY_DOWN: {
      return produce(designer, (newDesigner) => {
        const frames = getSelectedFrames(newDesigner);

        for (
          let i = 0, { length } = newDesigner.selectedNodePaths;
          i < length;
          i++
        ) {
          const frame = frames[i];
          const annotations: NodeAnnotations =
            (frame.annotations && computeVirtScriptObject(frame.annotations)) ||
            {};
          Object.assign(
            frame,
            updateAnnotations(frame, {
              frame: {
                visible: !(annotations.frame?.visible !== false),
              },
            })
          );

          // remove boxes so that they don't appear on screen
          delete newDesigner.frameBoxes[i];
          newDesigner.selectedNodeStyleInspections = [];
        }
      });
    }
    case ActionType.FRAME_TITLE_CHANGED: {
      return produce(designer, (newDesigner) => {
        const frame = getFrameFromIndex(action.payload.frameIndex, newDesigner);

        if (!frame) {
          console.warn(`Trying to resize non-frame`);
          return;
        }

        Object.assign(
          frame,
          updateAnnotations(frame, {
            frame: {
              title: action.payload.value,
            },
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
        ctrlKey,
        mousePosition,
        size,
      } = action.payload;

      const delta2X = deltaX * PAN_X_SENSITIVITY;
      const delta2Y = deltaY * PAN_Y_SENSITIVITY;

      return produce(designer, (newDesigner) => {
        const transform = newDesigner.canvas.transform;

        if (metaKey || ctrlKey) {
          newDesigner.canvas.transform = centerTransformZoom(
            newDesigner.canvas.transform,
            {
              x: 0,
              y: 0,
              width: size.width,
              height: size.height,
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
          clampCanvasTransform(
            newDesigner.canvas,
            flattenFrameBoxes(newDesigner.frameBoxes)
          )
        );
      });
    }
    case uiActions.toolLayerDragOver.type:
    case ActionType.CANVAS_MOUSE_MOVED: {
      return highlightNode(designer, action.payload);
    }
    case ActionType.DIR_LOADED: {
      return produce(designer, (newDesigner) => {
        if (action.payload.isRoot) {
          newDesigner.projectDirectory = action.payload.item;
        } else {
          const target = getFSItem(
            action.payload.item.absolutePath,
            newDesigner.projectDirectory
          );

          // if children are present, then skip - need to ensure that
          // nested children aren't removed.
          if (target && !(target as Directory).children.length) {
            (target as Directory).children = action.payload.item.children;
          }
        }
      });
    }
    case ActionType.CANVAS_RESIZED: {
      designer = produce(designer, (newDesigner) => {
        newDesigner.canvas.size = action.payload;
      });

      designer = maybeCenterCanvas(designer);

      return designer;
    }
  }

  return designer;
};

const handleDoubleClick = (
  designer: DesignerState,
  action: CanvasMouseDown
): [DesignerState, boolean] => {
  const oldTimestamp = designer.canvasClickTimestamp;

  if (
    !oldTimestamp ||
    action.payload.timestamp - oldTimestamp > DOUBLE_CLICK_MS
  ) {
    return [
      produce(designer, (newDesigner) => {
        newDesigner.canvasClickTimestamp = action.payload.timestamp;
      }),
      false,
    ];
  }

  const nodePath = getNodeInfoAtPoint(
    designer.canvas.mousePosition,
    designer.canvas.transform,
    getScopedBoxes(
      flattenFrameBoxes(designer.frameBoxes),
      designer.scopedElementPath,
      getActivePCData(designer).preview
    ),
    isExpanded(designer) ? getActiveFrameIndex(designer) : null
  )?.nodePath;

  designer = produce(designer, (newDesigner) => {
    newDesigner.canvasClickTimestamp = action.payload.timestamp;
    newDesigner.scopedElementPath = nodePath;
  });

  designer = highlightNode(designer, designer.canvas.mousePosition!);

  return [designer, true];
};

const cleanupPath = (pathname: string) =>
  path.normalize(pathname).replace(/\/$/, "");

const highlightNode = (designer: DesignerState, mousePosition: Point) => {
  return produce(designer, (newDesigner) => {
    newDesigner.canvas.mousePosition = mousePosition;
    const canvas = newDesigner.canvas;
    const info = getNodeInfoAtPoint(
      mousePosition,
      canvas.transform,
      getScopedBoxes(
        flattenFrameBoxes(designer.frameBoxes),
        designer.scopedElementPath,
        getActivePCData(designer).preview
      ),
      isExpanded(newDesigner) ? getActiveFrameIndex(newDesigner) : null
    );
    newDesigner.highlightNodePath = info?.nodePath;
  });
};
