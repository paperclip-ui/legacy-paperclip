import { init as initDesigner } from "tandem-designer/src/app";
import { ParentController } from "../parent";
import { createMemoryHistory } from "history";

export class DesignerController {
  constructor(
    private _workerParent: ParentController,
    private _mount: HTMLElement
  ) {}
  init() {
    initDesigner({
      mount: this._mount,
      history: createMemoryHistory(),
      showLaunchExternalButton: false,
      createConnection: () => this._workerParent.getWorkerConnection()
    });
  }
}
