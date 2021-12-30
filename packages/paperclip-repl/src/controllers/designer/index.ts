import { init as initDesigner } from "tandem-designer/src/app";
import { ParentController } from "../parent";
import { createMemoryHistory } from "history";
import { Options } from "../../app";

export class DesignerController {
  constructor(
    private _workerParent: ParentController,
    private _mount: HTMLElement,
    private _options: Options
  ) {}
  init() {
    initDesigner({
      mount: this._mount,
      history: createMemoryHistory(),
      showLaunchExternalButton: false,
      useLiteEditor: true,
      showCodeToolbar: true,
      showLeftSidebar: false,
      showInspectorPanels: false,
      floatingPreview: true,
      showCodeEditorOnStartup: true,
      activeFrame: this._options.activeFrame,
      rounded: true,
      codeEditorWidth: "200%",
      createConnection: () => this._workerParent.getWorkerConnection()
    });
  }
}
