import { BaseEvent, Observable } from "./events";

export interface Service {
  connect: (eventBus: Observable) => void;
}

export enum ServiceEventType {
  INITIALIZED = "ServiceEvent/INITIALIZED"
}

export type ServiceInitialized = BaseEvent<ServiceEventType.INITIALIZED>;

export class ServiceManager {
  private _services: Service[];
  private _eventBus: Observable;

  constructor(...services: Service[]) {
    this._eventBus = new Observable();
    this._services = [];
    this.add(...services);
  }
  add(...services: Service[]) {
    services.forEach(service => {
      this._services.push(service);
      service.connect(this._eventBus);
    });
  }
  initialize() {
    this._eventBus.dispatch({ type: ServiceEventType.INITIALIZED });
  }
}
