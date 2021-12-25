import { DesignerController } from "./controllers/designer";
import { ParentController } from "./controllers/parent";

export class App {
  constructor() {}
  init() {
    const workerParent = new ParentController();
    new DesignerController(workerParent).init();
  }
}
