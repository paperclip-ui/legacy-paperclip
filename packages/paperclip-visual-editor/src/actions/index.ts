import { InstanceAction } from "./instance-actions";
import { ServerAction } from "./server-actions";
import { ContentChanged } from "./external-actions";

export * from "./instance-actions";
export * from "./server-actions";
export * from "./external-actions";

export type Action = InstanceAction | ServerAction | ContentChanged;
