// import { PCMutation, PCSourceWriter } from "paperclip-source-writer";
// import * as vscode from "vscode";
// import * as url from "url";
// import { createEngineDelegate } from "paperclip";

// export function activate() {
//   const writer = new PCSourceWriter({
//     engine: createEngineDelegate(),
//     getContent: async (uri: string) => {
//       const filePath = url.fileURLToPath(uri);
//       const doc = await vscode.workspace.openTextDocument(filePath);
//       return doc.getText();
//     }
//   });

//   const handleMutations = async (mutations: PCMutation[]) => {
//     const changesByUri = await writer.getContentChanges(mutations);

//     for (const uri in changesByUri) {
//       const changes = changesByUri[uri];
//       const filePath = url.fileURLToPath(uri);
//       const doc = await vscode.workspace.openTextDocument(filePath);
//       const tedits = changes.map(change => {
//         return new vscode.TextEdit(
//           new vscode.Range(
//             doc.positionAt(change.start),
//             doc.positionAt(change.end)
//           ),
//           change.value
//         );
//       });
//       const wsEdit = new vscode.WorkspaceEdit();
//       wsEdit.set(vscode.Uri.parse(uri), tedits);
//       await vscode.workspace.applyEdit(wsEdit);
//     }
//   };
//   return {
//     handleMutations
//   };
// }
