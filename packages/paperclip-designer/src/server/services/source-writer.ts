import { EngineDelegate } from "paperclip";
import { PCMutationActionKind, PCSourceWriter } from "paperclip-source-writer";
import {
  Action,
  ActionType,
  pcSourceEdited,
  PCVirtObjectEdited,
  VirtualStyleDeclarationValueChanged
} from "../../actions";
import { Observable } from "../core/events";
import { ServerEvent, ServerEventType } from "../events";

// export const sourceWriterService = (
//   engine: EngineDelegate,
//   dispatch: (action: Action) => void
// ) => {
//   const textSourceWriter = new PCSourceWriter(engine);

//   const onVirtualStyleDeclarationValueChanged = (
//     action: VirtualStyleDeclarationValueChanged
//   ) => {
//     dispatch(
//       pcSourceEdited(
//         textSourceWriter.apply([
//           {
//             targetId: action.payload.declarationId,
//             action: {
//               kind: PCMutationActionKind.CSS_DECLARATION_CHANGED,
//               name: action.payload.name,
//               value: action.payload.value
//             }
//           }
//         ])
//       )
//     );
//   };

//   const handleVirtObjectEdited = async (action: PCVirtObjectEdited) => {
//     dispatch(pcSourceEdited(textSourceWriter.apply(action.payload.mutations)));
//   };

//   return {
//     connect: connect
//   }

//   return (action: Action) => {
//     switch (action.type) {
//       case ActionType.PC_VIRT_OBJECT_EDITED: {
//         return handleVirtObjectEdited(action);
//       }
//       case ActionType.VIRTUAL_STYLE_DECLARATION_VALUE_CHANGED: {
//         return onVirtualStyleDeclarationValueChanged(action);
//       }
//     }
//   };
// };

export const sourceWriterService = () => ({ connect });

const connect = (observable: Observable) => {
  const onEvent = (event: ServerEvent) => {
    switch (event.type) {
    }
  };

  observable.observe({
    onEvent
  });
};
