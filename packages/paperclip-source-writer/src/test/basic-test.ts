// import { expect } from "chai";
// import { PCMutationActionKind } from "../mutations";
// import { PCSourceWriter } from "../writer";
// import { createMockEngineDelegate } from "./utils";

// describe(__filename + "#", () => {
//   it(`Can update existing annotations`, async () => {
//     const graph = {
//       "/entry.pc": `
//         <!--
//           @a { b: 1 }
//         -->
//         <span />
//       `
//     };
//     const engine = await createMockEngineDelegate(graph);
//     engine.open("/entry.pc");
//     const writer = new PCSourceWriter({
//       getContent(uri) {
//         return graph[uri];
//       }
//     });

//     const changes = writer.getContentChanges({
//       action: {
//         kind: PCMutationActionKind.ANNOTATIONS_CHANGED,
//         annotations: {
//           a: {
//             b: 10
//           }
//         }
//       }
//     });

//     console.log(changes);
//   });
// });
