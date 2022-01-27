import { init as initDesigner } from "@tandem-ui/designer/src/app";
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
      createRPCClient: () => {
        return this._workerParent.getWorkerConnection();
      },
      showLaunchExternalButton: false,
      useLiteEditor: this._options.useLiteEditor !== false,
      showCodeToolbar: true,
      showLeftSidebar: false,
      showInspectorPanels: false,
      floatingPreview: this._options.floatingPreview !== false,
      showCodeEditorOnStartup: true,
      activeFrame: this._options.activeFrame,
      rounded: true,
      codeEditorWidth: "200%",
      createConnection: () => this._workerParent.getWorkerConnection(),
    });
  }
}
