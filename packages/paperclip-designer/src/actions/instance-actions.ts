import { BaseAction, actionCreator } from "./base";
import { PCMutation } from "paperclip-source-writer";
import {
  VirtualNode,
  BasicPaperclipAction,
  EngineErrorEvent,
  EngineDelegateEvent,
  LoadedData,
  ExprTextSource,
  Action,
  ExprSource,
  VirtNodeSource
} from "paperclip-utils";
import { Box, Directory, EnvOption, FSItemKind, Point, Size } from "../state";

export enum ActionType {
  RENDERER_CHANGED = "RENDERER_CHANGED",
  LOCATION_CHANGED = "LOCATION_CHANGED",
  RENDERER_MOUNTED = "RENDERER_MOUNTED",
  REDIRECT_REQUESTED = "REDIRECT_REQUESTED",
  ZOOM_IN_KEY_PRESSED = "ZOOM_IN_KEY_PRESSED",
  ZOOM_OUT_KEY_PRESSED = "ZOOM_OUT_KEY_PRESSED",
  BIRDSEYE_FILTER_CHANGED = "BIRDSEYE_FILTER_CHANGED",

  /**
   * @deprecated
   */
  ENV_OPTION_CLICKED = "ENV_OPTION_CLICKED",
  BIRDSEYE_TOP_FILTER_BLURRED = "BIRDSEYE_TOP_FILTER_BLURRED",
  RENDERER_UNMOUNTED = "RENDERER_UNMOUNTED",
  PC_FILE_OPENED = "PC_FILE_OPENED",
  GRID_BUTTON_CLICKED = "GRID_BUTTON_CLICKED",
  CLIENT_CONNECTED = "CLIENT_CONNECTED",
  ENGINE_ERRORED = "ENGINE_ERRORED",
  ERROR_BANNER_CLICKED = "ERROR_BANNER_CLICKED",
  CANVAS_MOUSE_LEAVE = "CANVAS_MOUSE_LEAVE",
  CANVAS_MOUSE_UP = "CANVAS_MOUSE_UP",
  ZOOM_IN_BUTTON_CLICKED = "ZOOM_IN_BUTTON_CLICKED",
  POPOUT_BUTTON_CLICKED = "POPOUT_BUTTON_CLICKED",
  POPOUT_WINDOW_REQUESTED = "POPOUT_WINDOW_REQUESTED",
  PASTED = "PASTED",
  ZOOM_OUT_BUTTON_CLICKED = "ZOOM_OUT_BUTTON_CLICKED",
  ZOOM_INPUT_CHANGED = "ZOOM_INPUT_CHANGED",
  CANVAS_RESIZED = "CANVAS_RESIZED",
  CANVAS_MOUSE_MOVED = "CANVAS_MOUSE_MOVED",
  TITLE_DOUBLE_CLICKED = "TITLE_DOUBLE_CLICKED",
  DIR_LOADED = "DIR_LOADED",
  FS_ITEM_CLICKED = "FS_ITEM_CLICKED",
  VIRTUAL_NODES_SELECTED = "VIRTUAL_NODES_SELECTED",
  NODE_BREADCRUMB_CLICKED = "NODE_BREADCRUMB_CLICKED",
  NODE_BREADCRUMB_MOUSE_ENTERED = "NODE_BREADCRUMB_MOUSE_ENTERED",
  NODE_BREADCRUMB_MOUSE_LEFT = "NODE_BREADCRUMB_MOUSE_LEFT",
  CANVAS_PAN_START = "CANVAS_PAN_START",
  CANVAS_PAN_END = "CANVAS_PAN_END",
  CANVAS_PANNED = "CANVAS_PANNED",
  RECTS_CAPTURED = "RECTS_CAPTURED",
  GLOBAL_ESCAPE_KEY_PRESSED = "GLOBAL_ESCAPE_KEY_PRESSED",
  GLOBAL_META_KEY_DOWN = "GLOBAL_META_KEY_DOWN",
  GLOBAL_OPTION_KEY_DOWN = "GLOBAL_OPTION_KEY_DOWN",
  GLOBAL_Z_KEY_DOWN = "GLOBAL_Z_KEY_DOWN",
  GLOBAL_Y_KEY_DOWN = "GLOBAL_Y_KEY_DOWN",
  GLOBAL_H_KEY_DOWN = "GLOBAL_H_KEY_DOWN",
  GRID_HOTKEY_PRESSED = "GRID_HOTKEY_PRESSED",
  GET_ALL_SCREENS_REQUESTED = "GET_ALL_SCREENS_REQUESTED",
  GLOBAL_SAVE_KEY_DOWN = "GLOBAL_SAVE_KEY_DOWN",
  GLOBAL_BACKSPACE_KEY_PRESSED = "GLOBAL_BACKSPACE_KEY_PRESSED",
  GLOBAL_BACKSPACE_KEY_SENT = "GLOBAL_BACKSPACE_KEY_SENT",
  GLOBAL_META_KEY_UP = "GLOBAL_META_KEY_UP",
  GLOBAL_OPTION_KEY_UP = "GLOBAL_OPTION_KEY_UP",
  ENGINE_DELEGATE_CHANGED = "ENGINE_DELEGATE_CHANGED",
  ENGINE_DELEGATE_EVENTS_HANDLED = "ENGINE_DELEGATE_EVENTS_HANDLED",
  FRAME_TITLE_CLICKED = "FRAME_TITLE_CLICKED",
  FILE_OPENED = "FILE_OPENED",
  RESIZER_PATH_MOUSE_MOVED = "RESIZER_PATH_MOUSE_MOVED",
  RESIZER_MOVED = "RESIZER_MOVED",
  RESIZER_STOPPED_MOVING = "RESIZER_STOPPED_MOVING",
  RESIZER_PATH_MOUSE_STOPPED_MOVING = "RESIZER_PATH_MOUSE_STOPPED_MOVING",
  META_CLICKED = "META_CLICKED",
  PC_VIRT_OBJECT_EDITED = "PC_VIRT_OBJECT_EDITED",

  ACTION_HANDLED = "ACTION_HANDLED",
  FRAME_TITLE_CHANGED = "FRAME_TITLE_CHANGED",
  EXPAND_FRAME_BUTTON_CLICKED = "EXPAND_FRAME_BUTTON_CLICKED",
  COLLAPSE_FRAME_BUTTON_CLICKED = "COLLAPSE_FRAME_BUTTON_CLICKED",
  VISUAL_EDITOR_INSTANCE_CHANGED = "VISUAL_EDITOR_INSTANCE_CHANGED",
  VIRTUAL_STYLE_DECLARATION_VALUE_CHANGED = "VIRTUAL_STYLE_DECLARATION_VALUE_CHANGED",
  STYLE_RULE_FILE_NAME_CLICKED = "STYLE_RULE_FILE_NAME_CLICKED"
}

export type WrappedEvent<T, TType extends ActionType, TPayload = undefined> = {
  sourceEvent: T;
} & BaseAction<TType, TPayload>;

export type ResizerMoved = WrappedEvent<
  MouseEvent,
  ActionType.RESIZER_MOVED,
  {
    originalBounds: Box;
    newBounds: Box;
    anchor: Point;
  }
>;

export type RendererMounted = BaseAction<
  ActionType.RENDERER_MOUNTED,
  { id: string }
>;
export type RendererUnmounted = BaseAction<
  ActionType.RENDERER_UNMOUNTED,
  { id: string }
>;
export type GridButtonClicked = BaseAction<ActionType.GRID_BUTTON_CLICKED>;

export type ResizerStoppedMoving = WrappedEvent<
  MouseEvent,
  ActionType.RESIZER_STOPPED_MOVING,
  {
    originalBounds: Box;
    newBounds: Box;
    anchor: Point;
  }
>;

export type NodeBreadcrumbClicked = BaseAction<
  ActionType.NODE_BREADCRUMB_CLICKED,
  {
    nodePath: string;
    metaKey: boolean;
  }
>;

export type NodeBreadcrumbMouseEntered = BaseAction<
  ActionType.NODE_BREADCRUMB_MOUSE_ENTERED,
  {
    nodePath: string;
  }
>;

export type NodeBreadcrumbMouseLeft = BaseAction<
  ActionType.NODE_BREADCRUMB_MOUSE_LEFT,
  {
    nodePath: string;
  }
>;

export type GridHotkeyPressed = WrappedEvent<
  MouseEvent,
  ActionType.GRID_HOTKEY_PRESSED
>;
export type GetAllScreensRequested = WrappedEvent<
  MouseEvent,
  ActionType.GET_ALL_SCREENS_REQUESTED
>;
export type EnvOptionClicked = BaseAction<
  ActionType.ENV_OPTION_CLICKED,
  {
    option: EnvOption;
    path: string;
  }
>;
export type VirtualNodesSelected = BaseAction<
  ActionType.VIRTUAL_NODES_SELECTED,
  { sources: Array<VirtNodeSource>; screenWidth: number }
>;

export type MetaClicked = BaseAction<
  ActionType.META_CLICKED,
  {
    nodePath: number[];
    nodeUri: string;
  }
>;
export type BirdseyeFilterChanged = BaseAction<
  ActionType.BIRDSEYE_FILTER_CHANGED,
  {
    value: string;
  }
>;

export type VirtualStyleDeclarationValueChanged = BaseAction<
  ActionType.VIRTUAL_STYLE_DECLARATION_VALUE_CHANGED,
  {
    declarationId: string;
    name: string;
    value: string;
  }
>;

export type StyleRuleFileNameClicked = BaseAction<
  ActionType.STYLE_RULE_FILE_NAME_CLICKED,
  {
    styleRuleSourceId: string;
  }
>;

export type TitleDoubleClicked = BaseAction<
  ActionType.TITLE_DOUBLE_CLICKED,
  { uri: string }
>;

export type BirdseyeTopFilterBlurred = BaseAction<
  ActionType.BIRDSEYE_TOP_FILTER_BLURRED
>;

export type PCFileLoaded = BaseAction<
  ActionType.PC_FILE_OPENED,
  {
    uri: string;
    data: LoadedData;
    document: string;
  }
>;
export type ClientConnected = BaseAction<ActionType.CLIENT_CONNECTED>;
export type LocationChanged = BaseAction<
  ActionType.LOCATION_CHANGED,
  {
    protocol: string;
    host: string;
    pathname: string;
    query: any;
  }
>;
export type RedirectRequested = BaseAction<
  ActionType.REDIRECT_REQUESTED,
  {
    pathname?: string;
    query?: any;
  }
>;

export type ExpandFrameButtonClicked = BaseAction<
  ActionType.EXPAND_FRAME_BUTTON_CLICKED,
  {
    frameIndex: number;
  }
>;

export type CollapseFrameButtonClicked = BaseAction<
  ActionType.COLLAPSE_FRAME_BUTTON_CLICKED
>;

export type ResizerPathMoved = WrappedEvent<
  MouseEvent,
  ActionType.RESIZER_PATH_MOUSE_MOVED,
  {
    originalBounds: Box;
    newBounds: Box;
  }
>;

export type PopoutButtonClicked = BaseAction<ActionType.POPOUT_BUTTON_CLICKED>;
export type PopoutWindowRequested = BaseAction<
  ActionType.POPOUT_WINDOW_REQUESTED,
  {
    uri: string;
  }
>;

export type ResizerPathStoppedMoving = WrappedEvent<
  MouseEvent,
  ActionType.RESIZER_PATH_MOUSE_STOPPED_MOVING,
  {
    originalBounds: Box;
    newBounds: Box;
  }
>;

export type PCVirtObjectEdited = BaseAction<
  ActionType.PC_VIRT_OBJECT_EDITED,
  {
    mutations: PCMutation[];
  }
>;

export type FrameTitleChanged = BaseAction<
  ActionType.FRAME_TITLE_CHANGED,
  {
    frameIndex: number;
    value: string;
  }
>;

export type Pasted = BaseAction<
  ActionType.PASTED,
  {
    clipboardData: Array<{
      type: string;
      content: string;
    }>;
  }
>;

export type FrameTitleClicked = BaseAction<
  ActionType.FRAME_TITLE_CLICKED,
  { frameIndex: number; shiftKey: boolean }
>;

export type EngineDelegateEventsHandled = BaseAction<
  ActionType.ENGINE_DELEGATE_EVENTS_HANDLED,
  { count: number; id: string }
>;
export type FileOpened = BaseAction<ActionType.FILE_OPENED, { uri: string }>;

export type RendererChanged = BaseAction<
  ActionType.RENDERER_CHANGED,
  { virtualRoot: VirtualNode }
>;

export type CanvasMouseUp = BaseAction<
  ActionType.CANVAS_MOUSE_UP,
  { metaKey: boolean; ctrlKey: boolean; shiftKey: boolean }
>;

export type CanvasMouseLeave = BaseAction<
  ActionType.CANVAS_MOUSE_LEAVE,
  { mousePosition: Point }
>;

export type CanvasPanned = BaseAction<
  ActionType.CANVAS_PANNED,
  {
    delta: Point;
    metaKey: boolean;
    ctrlKey: boolean;
    mousePosition: Point;
    size: Size;
  }
>;
export type CanvasPanStart = BaseAction<ActionType.CANVAS_PAN_START>;
export type CanvasPanEnd = BaseAction<ActionType.CANVAS_PAN_END>;
export type CanvasResized = BaseAction<ActionType.CANVAS_RESIZED, Size>;
export type CanvasMouseMoved = BaseAction<ActionType.CANVAS_MOUSE_MOVED, Point>;
export type ActionHandled = BaseAction<ActionType.ACTION_HANDLED>;
export type EngineErrored = BaseAction<
  ActionType.ENGINE_ERRORED,
  EngineErrorEvent
>;
export type ErrorBannerClicked = BaseAction<
  ActionType.ERROR_BANNER_CLICKED,
  EngineErrorEvent
>;

export type ZoomInButtonClicked = BaseAction<ActionType.ZOOM_IN_BUTTON_CLICKED>;
export type ZoomOutButtonClicked = BaseAction<
  ActionType.ZOOM_OUT_BUTTON_CLICKED
>;
export type ZoomInputChanged = BaseAction<
  ActionType.ZOOM_INPUT_CHANGED,
  { value: number }
>;
export type DirLoaded = BaseAction<
  ActionType.DIR_LOADED,
  {
    isRoot: boolean;
    item: Directory;
  }
>;
export type FSItemClicked = BaseAction<
  ActionType.FS_ITEM_CLICKED,
  {
    absolutePath: string;
    url: string;
    kind: FSItemKind;
  }
>;

export type RectsCaptured = BaseAction<
  ActionType.RECTS_CAPTURED,
  Record<string, Box>
>;

export type KeyComboPressed<TType extends ActionType> = BaseAction<TType, null>;

export const pcVirtObjectEdited = actionCreator<PCVirtObjectEdited>(
  ActionType.PC_VIRT_OBJECT_EDITED
);
export const gridButtonClicked = actionCreator<GridButtonClicked>(
  ActionType.GRID_BUTTON_CLICKED
);

export const frameTitleClicked = actionCreator<FrameTitleClicked>(
  ActionType.FRAME_TITLE_CLICKED
);
export const frameTitleChanged = actionCreator<FrameTitleChanged>(
  ActionType.FRAME_TITLE_CHANGED
);
export const titleDoubleClicked = actionCreator<TitleDoubleClicked>(
  ActionType.TITLE_DOUBLE_CLICKED
);
export const rendererMounted = actionCreator<RendererMounted>(
  ActionType.RENDERER_MOUNTED
);
export const rendererUnounted = actionCreator<RendererUnmounted>(
  ActionType.RENDERER_UNMOUNTED
);
export const birdseyeFilterChanged = actionCreator<BirdseyeFilterChanged>(
  ActionType.BIRDSEYE_FILTER_CHANGED
);
export const redirectRequest = actionCreator<RedirectRequested>(
  ActionType.REDIRECT_REQUESTED
);
export const nodeBreadcrumbClicked = actionCreator<NodeBreadcrumbClicked>(
  ActionType.NODE_BREADCRUMB_CLICKED
);
export const nodeBreadcrumbMouseEntered = actionCreator<
  NodeBreadcrumbMouseEntered
>(ActionType.NODE_BREADCRUMB_MOUSE_ENTERED);
export const nodeBreadcrumbMouseLeft = actionCreator<NodeBreadcrumbMouseLeft>(
  ActionType.NODE_BREADCRUMB_MOUSE_LEFT
);
export const engineDelegateEventsHandled = actionCreator<
  EngineDelegateEventsHandled
>(ActionType.ENGINE_DELEGATE_EVENTS_HANDLED);
export const fileOpened = actionCreator<FileOpened>(ActionType.FILE_OPENED);
export const errorBannerClicked = actionCreator<ErrorBannerClicked>(
  ActionType.ERROR_BANNER_CLICKED
);
export const pcFileLoaded = actionCreator<PCFileLoaded>(
  ActionType.PC_FILE_OPENED
);
export const expandFrameButtonClicked = actionCreator<ExpandFrameButtonClicked>(
  ActionType.EXPAND_FRAME_BUTTON_CLICKED
);
export const collapseFrameButtonClicked = actionCreator<
  CollapseFrameButtonClicked
>(ActionType.COLLAPSE_FRAME_BUTTON_CLICKED);
export const resizerPathMoved = actionCreator<ResizerPathMoved>(
  ActionType.RESIZER_PATH_MOUSE_MOVED
);
export const locationChanged = actionCreator<LocationChanged>(
  ActionType.LOCATION_CHANGED
);
export const envOptionClicked = actionCreator<EnvOptionClicked>(
  ActionType.ENV_OPTION_CLICKED
);

export const virtualStyleDeclarationValueChanged = actionCreator<
  VirtualStyleDeclarationValueChanged
>(ActionType.VIRTUAL_STYLE_DECLARATION_VALUE_CHANGED);

export const styleRuleFileNameClicked = actionCreator<StyleRuleFileNameClicked>(
  ActionType.STYLE_RULE_FILE_NAME_CLICKED
);

export const metaClicked = actionCreator<MetaClicked>(ActionType.META_CLICKED);
export const resizerPathStoppedMoving = actionCreator<ResizerPathStoppedMoving>(
  ActionType.RESIZER_PATH_MOUSE_STOPPED_MOVING
);
export const actionHandled = actionCreator<ActionHandled>(
  ActionType.ACTION_HANDLED
);
export const birdseyeTopFilterBlurred = actionCreator<BirdseyeTopFilterBlurred>(
  ActionType.BIRDSEYE_TOP_FILTER_BLURRED
);
export const resizerMoved = actionCreator<ResizerMoved>(
  ActionType.RESIZER_MOVED
);
export const resizerStoppedMoving = actionCreator<ResizerStoppedMoving>(
  ActionType.RESIZER_STOPPED_MOVING
);
export const rectsCaptured = actionCreator<RectsCaptured>(
  ActionType.RECTS_CAPTURED
);
export const canvasMouseUp = actionCreator<CanvasMouseUp>(
  ActionType.CANVAS_MOUSE_UP
);
export const canvasMouseLeave = actionCreator<CanvasMouseLeave>(
  ActionType.CANVAS_MOUSE_LEAVE
);
export const canvasPanned = actionCreator<CanvasPanned>(
  ActionType.CANVAS_PANNED
);
export const canvasPanStart = actionCreator<CanvasPanStart>(
  ActionType.CANVAS_PAN_START
);
export const canvasPanEnd = actionCreator<CanvasPanEnd>(
  ActionType.CANVAS_PAN_END
);
export const canvasResized = actionCreator<CanvasResized>(
  ActionType.CANVAS_RESIZED
);
export const canvasMouseMoved = actionCreator<CanvasMouseMoved>(
  ActionType.CANVAS_MOUSE_MOVED
);
export const rendererChanged = actionCreator<RendererChanged>(
  ActionType.RENDERER_CHANGED
);
export const engineErrored = actionCreator<EngineErrored>(
  ActionType.ENGINE_ERRORED
);
export const zoomInButtonClicked = actionCreator<ZoomInButtonClicked>(
  ActionType.ZOOM_IN_BUTTON_CLICKED
);
export const zoomOutButtonClicked = actionCreator<ZoomOutButtonClicked>(
  ActionType.ZOOM_OUT_BUTTON_CLICKED
);
export const zoomInputChanged = actionCreator<ZoomInputChanged>(
  ActionType.ZOOM_INPUT_CHANGED
);
export const popoutWindowRequested = actionCreator<PopoutWindowRequested>(
  ActionType.POPOUT_WINDOW_REQUESTED
);
export const globalEscapeKeyPressed = actionCreator<
  KeyComboPressed<ActionType.GLOBAL_ESCAPE_KEY_PRESSED>
>(ActionType.GLOBAL_ESCAPE_KEY_PRESSED);

export const globalBackspaceKeyPressed = actionCreator<
  KeyComboPressed<ActionType.GLOBAL_BACKSPACE_KEY_PRESSED>
>(ActionType.GLOBAL_BACKSPACE_KEY_PRESSED);

export const globalBackspaceKeySent = actionCreator<
  KeyComboPressed<ActionType.GLOBAL_BACKSPACE_KEY_SENT>
>(ActionType.GLOBAL_BACKSPACE_KEY_SENT);

export const globalMetaKeyDown = actionCreator<
  KeyComboPressed<ActionType.GLOBAL_META_KEY_DOWN>
>(ActionType.GLOBAL_META_KEY_DOWN);

export const globalOptionKeyDown = actionCreator<
  KeyComboPressed<ActionType.GLOBAL_OPTION_KEY_DOWN>
>(ActionType.GLOBAL_OPTION_KEY_DOWN);

export const globalZKeyDown = actionCreator<KeyComboPressed<ActionType>>(
  ActionType.GLOBAL_Z_KEY_DOWN
);
export const popoutButtonClicked = actionCreator<PopoutButtonClicked>(
  ActionType.POPOUT_BUTTON_CLICKED
);
export const clientConnected = actionCreator<ClientConnected>(
  ActionType.CLIENT_CONNECTED
);

export const globalYKeyDown = actionCreator<KeyComboPressed<ActionType>>(
  ActionType.GLOBAL_Y_KEY_DOWN
);

export const globalHKeyDown = actionCreator<KeyComboPressed<ActionType>>(
  ActionType.GLOBAL_H_KEY_DOWN
);

export const globalSaveKeyPress = actionCreator<KeyComboPressed<ActionType>>(
  ActionType.GLOBAL_SAVE_KEY_DOWN
);

export const globalMetaKeyUp = actionCreator<
  KeyComboPressed<ActionType.GLOBAL_META_KEY_UP>
>(ActionType.GLOBAL_META_KEY_UP);
export const globalOptionKeyUp = actionCreator<
  KeyComboPressed<ActionType.GLOBAL_OPTION_KEY_UP>
>(ActionType.GLOBAL_OPTION_KEY_UP);
export const dirLoaded = actionCreator<DirLoaded>(ActionType.DIR_LOADED);
export const fsItemClicked = actionCreator<FSItemClicked>(
  ActionType.FS_ITEM_CLICKED
);
export const pasted = actionCreator<Pasted>(ActionType.PASTED);
export const gridHotkeyPressed = actionCreator<GridHotkeyPressed>(
  ActionType.GRID_HOTKEY_PRESSED
);
export const getAllScreensRequested = actionCreator<GetAllScreensRequested>(
  ActionType.GET_ALL_SCREENS_REQUESTED
);
export const zoomInKeyPressed = actionCreator<
  KeyComboPressed<ActionType.ZOOM_IN_KEY_PRESSED>
>(ActionType.ZOOM_IN_KEY_PRESSED);
export const zoomOutKeyPressed = actionCreator<
  KeyComboPressed<ActionType.ZOOM_OUT_KEY_PRESSED>
>(ActionType.ZOOM_OUT_KEY_PRESSED);

export const virtualNodesSelected = actionCreator<VirtualNodesSelected>(
  ActionType.VIRTUAL_NODES_SELECTED
);

export type InstanceAction =
  // | RendererInitialized
  | RectsCaptured
  | CanvasMouseUp
  | ResizerPathMoved
  | VirtualStyleDeclarationValueChanged
  | VirtualNodesSelected
  | NodeBreadcrumbClicked
  | ResizerPathStoppedMoving
  | NodeBreadcrumbMouseEntered
  | NodeBreadcrumbMouseLeft
  | Pasted
  | RendererMounted
  | RedirectRequested
  | RendererUnmounted
  | BirdseyeFilterChanged
  | FrameTitleChanged
  | MetaClicked
  | ResizerStoppedMoving
  | BirdseyeTopFilterBlurred
  | ResizerMoved
  | GridHotkeyPressed
  | RendererChanged
  | CanvasPanned
  | CanvasPanStart
  | PCVirtObjectEdited
  | CanvasMouseLeave
  | PCFileLoaded
  | GridButtonClicked
  | GetAllScreensRequested
  | CanvasPanEnd
  | PopoutWindowRequested
  | CanvasResized
  | CanvasMouseMoved
  | ErrorBannerClicked
  | FileOpened
  | MetaClicked
  | LocationChanged
  | TitleDoubleClicked
  | PopoutButtonClicked
  | CollapseFrameButtonClicked
  | ExpandFrameButtonClicked
  | BasicPaperclipAction
  | ZoomInButtonClicked
  | ActionHandled
  | StyleRuleFileNameClicked
  | ZoomInputChanged
  | ClientConnected
  | EnvOptionClicked
  | FrameTitleClicked
  | EngineDelegateEventsHandled
  | KeyComboPressed<ActionType.GLOBAL_OPTION_KEY_DOWN>
  | KeyComboPressed<ActionType.GLOBAL_OPTION_KEY_UP>
  | KeyComboPressed<ActionType.GLOBAL_META_KEY_DOWN>
  | KeyComboPressed<ActionType.ZOOM_IN_KEY_PRESSED>
  | KeyComboPressed<ActionType.ZOOM_OUT_KEY_PRESSED>
  | KeyComboPressed<ActionType.GLOBAL_META_KEY_UP>
  | KeyComboPressed<ActionType.GLOBAL_SAVE_KEY_DOWN>
  | KeyComboPressed<ActionType.GLOBAL_ESCAPE_KEY_PRESSED>
  | KeyComboPressed<ActionType.GLOBAL_BACKSPACE_KEY_PRESSED>
  | KeyComboPressed<ActionType.GLOBAL_BACKSPACE_KEY_SENT>
  | KeyComboPressed<ActionType.GLOBAL_Y_KEY_DOWN>
  | KeyComboPressed<ActionType.GLOBAL_Z_KEY_DOWN>
  | KeyComboPressed<ActionType.GLOBAL_H_KEY_DOWN>
  | EngineErrored
  | ZoomOutButtonClicked
  | DirLoaded
  | FSItemClicked;
