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
    documentMouseUp: null,
  },
  "uiActions"
);

export type UIActions = ExtractJoinedActionFromCreators<typeof uiActions>;
