import { BaseEvent, Observable } from "./events";

export interface BaseServerKernel {
  readonly events: Observable;
}

export class ServerKernel implements BaseServerKernel {
  events = new Observable();
}
