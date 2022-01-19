import { PCDocument } from "@paperclip-ui/editor-engine/lib/client/documents";
import { Project } from "@tandem-ui/workspace-client/lib/project";
import { workspaceActions } from "../../actions/workspace-actions";
import { disposableHandler, disposables } from "../utils";
import { Kernel } from "./core";

// Some rules:
// - only one side effect per handler
// - all state needs to be in localStore. No hidden state

export const manageSideEffects = (kernel: Kernel) => {
  loadAllFramesHandler(kernel);
  watchDocumentChangeHandler(kernel);
  loadProjectHandler(kernel);
};

/**
 */

const loadAllFramesHandler = ({ localStore, dispatch }: Kernel) => {
  let dispose;

  localStore.bind(
    async ([project, showAllScreens]: [Project, boolean]) => {
      if (!project || !showAllScreens) {
        return;
      }

      const allDocs = await project.openAllPaperclipDocuments();

      // notify the rest of the app
      dispatch(workspaceActions.allFramesLoaded(allDocs));
    },
    (v) => [v.currentProject, v.showAllScreens]
  );
};

/**
 */

const watchDocumentChangeHandler = ({ localStore, dispatch }: Kernel) =>
  localStore.bind(
    disposableHandler((allDocuments: PCDocument[]) => {
      if (!allDocuments) {
        return () => {};
      }

      console.log("watching for documents to change");
      const listeners = [];

      for (const doc of allDocuments) {
        listeners.push(
          doc.onAppliedChanges((content, event) => {
            dispatch(
              workspaceActions.pcContentUpdated({
                uri: doc.uri,
                content,
                event,
              })
            );
          })
        );
      }

      return disposables(listeners);
    }),
    (v) => v.allDocuments
  );

/**
 */

const loadProjectHandler = ({ client, localStore, dispatch }: Kernel) => {
  localStore.bind(
    async (projectId: string) => {
      if (!projectId) {
        return;
      }
      console.log("loading project");

      const project = await client.openProject({ id: projectId });

      dispatch(workspaceActions.projectLoaded(project));
    },
    (v) => v.currentProjectId
  );
};
