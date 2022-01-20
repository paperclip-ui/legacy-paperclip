// import { Action, ActionType } from "../..";
// import { workspaceActions, mainActions } from "../../actions";
// import { Kernel } from "./core";

// export const manageLocalState = (state: Kernel) => {
//   return (action: Action) => {
//     switch (action.type) {
//       case mainActions.locationChanged.type: {
//         return state.localStore.update((state) => {
//           state.showAllScreens = Boolean(action.payload.query.showAll);
//           state.currentProjectId = action.payload.query.projectId;
//         });
//       }
//       case workspaceActions.projectLoaded.type: {
//         return state.localStore.update((state) => {
//           state.currentProject = action.payload;
//         });
//       }
//       case workspaceActions.allFramesLoaded.type: {
//         return state.localStore.update((state) => {
//           state.allDocuments = action.payload;
//         });
//       }
//       case ActionType.POPOUT_BUTTON_CLICKED: {
//         // TODO - pop current window
//         return state.localStore;
//       }
//     }
//   };
// };
