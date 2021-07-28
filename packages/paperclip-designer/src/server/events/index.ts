import * as sockjs from "sockjs";
import { BaseEvent } from "../core/events";
import { ServiceInitialized } from "../core/service-manager";

export enum ServerEventType {
  REMOTE_CONNECTION = "REMOTE_CONNECTION"
}

export type RemoteConnection = {
  connection: sockjs.Connection;
} & BaseEvent<ServerEventType.REMOTE_CONNECTION>;

export type ServerEvent = RemoteConnection | ServiceInitialized;

export type Dispatch = (event: ServerEvent) => void;
