import { BaseAction, actionCreator } from "./base";
import {
  VirtualNode,
  EngineErrorEvent
} from "../../../paperclip-web-renderer/node_modules/paperclip-utils";
import { Point, Size } from "../state";

export enum ActionType {
  RENDERER_INITIALIZED = "RENDERER_INITIALIZED",
  RENDERER_CHANGED = "RENDERER_CHANGED",
  ENGINE_ERRORED = "ENGINE_ERRORED",
  ERROR_BANNER_CLICKED = "ERROR_BANNER_CLICKED",
  CANVAS_ELEMENT_CLICKED = "CANVAS_ELEMENT_CLICKED",
  ZOOM_IN_BUTTON_CLICKED = "ZOOM_IN_BUTTON_CLICKED",
  ZOOM_OUT_BUTTON_CLICKED = "ZOOM_OUT_BUTTON_CLICKED",
  PAINT_BUTTON_CLICKED = "PAINT_BUTTON_CLICKED",
  CANVAS_RESIZED = "CANVAS_RESIZED",
  CANVAS_MOUSE_MOVED = "CANVAS_MOUSE_MOVED",
  CANVAS_PAN_START = "CANVAS_PAN_START",
  CANVAS_PAN_END = "CANVAS_PAN_END",
  CANVAS_PANNED = "CANVAS_PANNED",
  RECTS_CAPTURED = "RECTS_CAPTURED",
  GLOBAL_ESCAPE_KEY_PRESSED = "GLOBAL_ESCAPE_KEY_PRESSED",
  GLOBAL_META_KEY_DOWN = "GLOBAL_META_KEY_DOWN",
  GLOBAL_META_KEY_UP = "GLOBAL_META_KEY_UP"
}

export type RendererInitialized = BaseAction<
  ActionType.RENDERER_INITIALIZED,
  { element: HTMLElement }
>;

export type RendererChanged = BaseAction<
  ActionType.RENDERER_CHANGED,
  { virtualRoot: VirtualNode }
>;

export type CanvasElementClicked = BaseAction<
  ActionType.CANVAS_ELEMENT_CLICKED,
  { metaKey: boolean; nodePath: string }
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

export type RectsCaptured = BaseAction<
  ActionType.RECTS_CAPTURED,
  {
    rects: Record<string, ClientRect>;
    frameSize: Size;
    scrollSize: Size;
  }
>;

export type KeyComboPressed<TType extends ActionType> = BaseAction<TType, null>;

export const errorBannerClicked = actionCreator<ErrorBannerClicked>(
  ActionType.ERROR_BANNER_CLICKED
);

export const rendererInitialized = actionCreator<RendererInitialized>(
  ActionType.RENDERER_INITIALIZED
);
export const rectsCaptured = actionCreator<RectsCaptured>(
  ActionType.RECTS_CAPTURED
);
export const canvasElementClicked = actionCreator<CanvasElementClicked>(
  ActionType.CANVAS_ELEMENT_CLICKED
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
export const globalMetaKeyDown = actionCreator<
  KeyComboPressed<ActionType.GLOBAL_META_KEY_DOWN>
>(ActionType.GLOBAL_META_KEY_DOWN);
export const globalMetaKeyUp = actionCreator<
  KeyComboPressed<ActionType.GLOBAL_META_KEY_UP>
>(ActionType.GLOBAL_META_KEY_UP);

export type Action =
  | RendererInitialized
  | RectsCaptured
  | CanvasElementClicked
  | RendererChanged
  | CanvasPanned
  | CanvasPanStart
  | CanvasPanEnd
  | CanvasResized
  | CanvasMouseMoved
  | ErrorBannerClicked
  | ZoomInButtonClicked
  | PainButtonClicked
  | KeyComboPressed<ActionType.GLOBAL_META_KEY_DOWN>
  | KeyComboPressed<ActionType.GLOBAL_META_KEY_UP>
  | KeyComboPressed<ActionType.GLOBAL_ESCAPE_KEY_PRESSED>
  | EngineErrored
  | ZoomOutButtonClicked;
