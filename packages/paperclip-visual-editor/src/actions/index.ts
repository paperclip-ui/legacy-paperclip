import { BaseAction, actionCreator } from "./base";
import { VirtualNode } from "../../../paperclip-web-renderer/node_modules/paperclip-utils";

export enum ActionType {
  RENDERER_INITIALIZED = "RENDERER_INITIALIZED",
  RENDERER_CHANGED = "RENDERER_CHANGED",
  CANVAS_ELEMENT_CLICKED = "CANVAS_ELEMENT_CLICKED",
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
export const rendererChanged = actionCreator<RendererChanged>(
  ActionType.RENDERER_CHANGED
);

export type Action =
  | RendererInitialized
  | RectsCaptured
  | CanvasElementClicked
  | RendererChanged;
