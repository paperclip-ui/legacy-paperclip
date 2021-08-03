import { BaseEvent, Observable } from "paperclip-common";

export interface BaseServerKernel {
  readonly events: Observable;
}

export class ServerKernel implements BaseServerKernel {
  events = new Observable();
}
