import { BaseAction, actionCreator } from "./base";
import { PCMutation } from "paperclip-source-writer";
import {
  VirtualNode,
  EngineErrorEvent,
  EngineDelegateEvent,
  LoadedData,
  ExprSource
} from "../../../paperclip-web-renderer/node_modules/paperclip-utils";
import { Box, Directory, FSItemKind, Point, Size } from "../state";

export enum ActionType {
  // RENDERER_INITIALIZED = "RENDERER_INITIALIZED",
  RENDERER_CHANGED = "RENDERER_CHANGED",
  LOCATION_CHANGED = "LOCATION_CHANGED",
  CLIENT_CONNECTED = "CLIENT_CONNECTED",
  ENGINE_ERRORED = "ENGINE_ERRORED",
  ERROR_BANNER_CLICKED = "ERROR_BANNER_CLICKED",
  DOCUMENT_CONTENT_CHANGED = "DOCUMENT_CONTENT_CHANGED",
  CANVAS_MOUSE_LEAVE = "CANVAS_MOUSE_LEAVE",
  CANVAS_MOUSE_UP = "CANVAS_MOUSE_UP",
  ZOOM_IN_BUTTON_CLICKED = "ZOOM_IN_BUTTON_CLICKED",
  PASTED = "PASTED",
  ZOOM_OUT_BUTTON_CLICKED = "ZOOM_OUT_BUTTON_CLICKED",
  PAINT_BUTTON_CLICKED = "PAINT_BUTTON_CLICKED",
  CANVAS_RESIZED = "CANVAS_RESIZED",
  CANVAS_MOUSE_MOVED = "CANVAS_MOUSE_MOVED",
  DIR_LOADED = "DIR_LOADED",
  FS_ITEM_CLICKED = "FS_ITEM_CLICKED",
  CANVAS_PAN_START = "CANVAS_PAN_START",
  CANVAS_PAN_END = "CANVAS_PAN_END",
  CANVAS_PANNED = "CANVAS_PANNED",
  RECTS_CAPTURED = "RECTS_CAPTURED",
  GLOBAL_ESCAPE_KEY_PRESSED = "GLOBAL_ESCAPE_KEY_PRESSED",
  GLOBAL_META_KEY_DOWN = "GLOBAL_META_KEY_DOWN",
  GLOBAL_Z_KEY_DOWN = "GLOBAL_Z_KEY_DOWN",
  GLOBAL_Y_KEY_DOWN = "GLOBAL_Y_KEY_DOWN",
  GLOBAL_H_KEY_DOWN = "GLOBAL_H_KEY_DOWN",
  GLOBAL_SAVE_KEY_DOWN = "GLOBAL_SAVE_KEY_DOWN",
  GLOBAL_BACKSPACE_KEY_PRESSED = "GLOBAL_BACKSPACE_KEY_PRESSED",
  GLOBAL_BACKSPACE_KEY_SENT = "GLOBAL_BACKSPACE_KEY_SENT",
  GLOBAL_META_KEY_UP = "GLOBAL_META_KEY_UP",
  ENGINE_DELEGATE_CHANGED = "ENGINE_DELEGATE_CHANGED",
  CURRENT_FILE_INITIALIZED = "CURRENT_FILE_INITIALIZED",
  ENGINE_DELEGATE_EVENTS_HANDLED = "ENGINE_DELEGATE_EVENTS_HANDLED",
  FRAME_TITLE_CLICKED = "FRAME_TITLE_CLICKED",
  FILE_OPENED = "FILE_OPENED",
  RESIZER_PATH_MOUSE_MOVED = "RESIZER_PATH_MOUSE_MOVED",
  RESIZER_MOVED = "RESIZER_MOVED",
  RESIZER_STOPPED_MOVING = "RESIZER_STOPPED_MOVING",
  RESIZER_PATH_MOUSE_STOPPED_MOVING = "RESIZER_PATH_MOUSE_STOPPED_MOVING",
  META_CLICKED = "META_CLICKED",
  PC_VIRT_OBJECT_EDITED = "PC_VIRT_OBJECT_EDITED",
  FRAME_TITLE_CHANGED = "FRAME_TITLE_CHANGED",
  EXPAND_FRAME_BUTTON_CLICKED = "EXPAND_FRAME_BUTTON_CLICKED",
  COLLAPSE_FRAME_BUTTON_CLICKED = "COLLAPSE_FRAME_BUTTON_CLICKED"
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

export type ResizerStoppedMoving = WrappedEvent<
  MouseEvent,
  ActionType.RESIZER_STOPPED_MOVING,
  {
    originalBounds: Box;
    newBounds: Box;
    anchor: Point;
  }
>;
export type MetaClicked = BaseAction<
  ActionType.META_CLICKED,
  {
    source: ExprSource;
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

export type ExpandFrameButtonClicked = BaseAction<
  ActionType.EXPAND_FRAME_BUTTON_CLICKED,
  {
    frameIndex: number;
  }
>;

export type CollapseFrameButtonClicked = BaseAction<
  ActionType.COLLAPSE_FRAME_BUTTON_CLICKED
>;

export type DocumentContentChanged = BaseAction<
  ActionType.DOCUMENT_CONTENT_CHANGED,
  {
    uri: string;
    content: string;
  }
>;

export type ResizerPathMoved = WrappedEvent<
  MouseEvent,
  ActionType.RESIZER_PATH_MOUSE_MOVED,
  {
    originalBounds: Box;
    newBounds: Box;
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

export type EngineDelegateChanged = BaseAction<
  ActionType.ENGINE_DELEGATE_CHANGED,
  EngineDelegateEvent
>;
export type CurrentFileInitialized = BaseAction<
  ActionType.CURRENT_FILE_INITIALIZED,
  LoadedData
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
  { count: number }
>;
export type FileOpened = BaseAction<ActionType.FILE_OPENED, { uri: string }>;

export type RendererChanged = BaseAction<
  ActionType.RENDERER_CHANGED,
  { virtualRoot: VirtualNode }
>;

export type CanvasMouseUp = BaseAction<
  ActionType.CANVAS_MOUSE_UP,
  { metaKey: boolean; shiftKey: boolean }
>;

export type CanvasMouseLeave = BaseAction<
  ActionType.CANVAS_MOUSE_LEAVE,
  { mousePosition: Point }
>;

export type CanvasPanned = BaseAction<
  ActionType.CANVAS_PANNED,
  { delta: Point; metaKey: boolean; mousePosition: Point; size: Size }
>;
export type CanvasPanStart = BaseAction<ActionType.CANVAS_PAN_START>;
export type CanvasPanEnd = BaseAction<ActionType.CANVAS_PAN_END>;
export type CanvasResized = BaseAction<ActionType.CANVAS_RESIZED, Size>;
export type CanvasMouseMoved = BaseAction<ActionType.CANVAS_MOUSE_MOVED, Point>;
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
export type PainButtonClicked = BaseAction<ActionType.PAINT_BUTTON_CLICKED>;
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
export const engineDelegateChanged = actionCreator<EngineDelegateChanged>(
  ActionType.ENGINE_DELEGATE_CHANGED
);
export const currentFileInitialized = actionCreator<CurrentFileInitialized>(
  ActionType.CURRENT_FILE_INITIALIZED
);
export const frameTitleClicked = actionCreator<FrameTitleClicked>(
  ActionType.FRAME_TITLE_CLICKED
);
export const frameTitleChanged = actionCreator<FrameTitleChanged>(
  ActionType.FRAME_TITLE_CHANGED
);
export const engineDelegateEventsHandled = actionCreator<
  EngineDelegateEventsHandled
>(ActionType.ENGINE_DELEGATE_EVENTS_HANDLED);
export const fileOpened = actionCreator<FileOpened>(ActionType.FILE_OPENED);
export const errorBannerClicked = actionCreator<ErrorBannerClicked>(
  ActionType.ERROR_BANNER_CLICKED
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
export const resizerPathStoppedMoving = actionCreator<ResizerPathStoppedMoving>(
  ActionType.RESIZER_PATH_MOUSE_STOPPED_MOVING
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
export const paintButtonClicked = actionCreator<PainButtonClicked>(
  ActionType.PAINT_BUTTON_CLICKED
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

export const globalZKeyDown = actionCreator<KeyComboPressed<ActionType>>(
  ActionType.GLOBAL_Z_KEY_DOWN
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
export const dirLoaded = actionCreator<DirLoaded>(ActionType.DIR_LOADED);
export const fsItemClicked = actionCreator<FSItemClicked>(
  ActionType.FS_ITEM_CLICKED
);
export const pasted = actionCreator<Pasted>(ActionType.PASTED);

export type Action =
  // | RendererInitialized
  | RectsCaptured
  | CanvasMouseUp
  | ResizerPathMoved
  | ResizerPathStoppedMoving
  | DocumentContentChanged
  | Pasted
  | FrameTitleChanged
  | MetaClicked
  | ResizerStoppedMoving
  | ResizerMoved
  | RendererChanged
  | CanvasPanned
  | CanvasPanStart
  | CanvasMouseLeave
  | CanvasPanEnd
  | CanvasResized
  | CanvasMouseMoved
  | ErrorBannerClicked
  | CurrentFileInitialized
  | FileOpened
  | LocationChanged
  | CollapseFrameButtonClicked
  | ExpandFrameButtonClicked
  | ZoomInButtonClicked
  | ClientConnected
  | FrameTitleClicked
  | EngineDelegateChanged
  | PainButtonClicked
  | EngineDelegateEventsHandled
  | KeyComboPressed<ActionType.GLOBAL_META_KEY_DOWN>
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
