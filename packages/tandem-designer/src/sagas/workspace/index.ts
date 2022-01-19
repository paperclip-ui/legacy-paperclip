// import { call, fork } from "redux-saga/effects";
// import { Project } from "@tandem-ui/workspace-client/lib/project";
// import SockJSClient from "sockjs-client";
// import { WorkspaceClient } from "@tandem-ui/workspace-client";
// import { sockjsClientAdapter } from "@paperclip-ui/common";

// export function* handleWorkspace() {
//   const client = new WorkspaceClient(
//     sockjsClientAdapter(
//       new SockJSClient(location.protocol + "//" + location.host + "/rt")
//     )
//   );
//   console.log(docs);
// }

// function* handleCurrentProject(cilent: WorkspaceClient) {
//   yield call(loadProject);
// }

// function* loadProject() {
//   const project: Project = yield call(client.openProject, {
//     id: new URLSearchParams(location.search).get("projectId")
//   });
// }
