import { init as initDesigner } from "tandem-designer/src/app";
import { ParentController } from "../parent";

export class DesignerController {
  constructor(private _workerParent: ParentController) {}
  init() {
    initDesigner({
      createConnection: () => this._workerParent.getWorkerConnection()
    });
  }
}
