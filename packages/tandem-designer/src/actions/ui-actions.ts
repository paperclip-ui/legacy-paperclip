import { AvailableNode } from "@paperclip-ui/language-service";
import { Point } from "../state";
import {
  actionCreators,
  ExtractJoinedActionFromCreators,
  identity,
} from "./util";

export const uiActions = actionCreators(
  {
    quickfindItemStartDrag: identity<AvailableNode>(),
    quickfindItemClick: identity<AvailableNode>(),
    toolLayerDragOver: identity<Point>(),
    toolLayerDrop: identity<{ node: AvailableNode; point: Point }>(),
    canvasTextContentChanges: identity<{ value: string }>(),
    documentMouseUp: null,
    computedStyleDeclarationChanged: identity<{
      oldName?: string;
      id?: string;
      name: string;
      value: string;
    }>(),
  },
  "uiActions"
);

export type UIActions = ExtractJoinedActionFromCreators<typeof uiActions>;
