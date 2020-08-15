import { BaseAction, actionCreator } from "./base";
import { VirtualNode } from "../../../paperclip-web-renderer/node_modules/paperclip-utils";
import { Point, Size } from "../state";

export enum ActionType {
  RENDERER_INITIALIZED = "RENDERER_INITIALIZED",
  RENDERER_CHANGED = "RENDERER_CHANGED",
  CANVAS_ELEMENT_CLICKED = "CANVAS_ELEMENT_CLICKED",
  CANVAS_PAN_START = "CANVAS_PAN_START",
  CANVAS_PAN_END = "CANVAS_PAN_END",
  CANVAS_PANNED = "CANVAS_PANNED",
  RECTS_CAPTURED = "RECTS_CAPTURED"
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

export type RectsCaptured = BaseAction<
  ActionType.RECTS_CAPTURED,
  Record<string, ClientRect>
>;

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
export const rendererChanged = actionCreator<RendererChanged>(
  ActionType.RENDERER_CHANGED
);

export type Action =
  | RendererInitialized
  | RectsCaptured
  | CanvasElementClicked
  | RendererChanged
  | CanvasPanned
  | CanvasPanStart
  | CanvasPanEnd;
