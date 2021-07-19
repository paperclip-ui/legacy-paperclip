import { EngineDelegate } from "paperclip";
import {
  CSSDeclarationChanged,
  PCMutationActionKind,
  PCSourceWriter
} from "paperclip-source-writer";
import {
  Action,
  ActionType,
  pcSourceEdited,
  PCVirtObjectEdited,
  VirtualStyleDeclarationValueChanged
} from "../../actions";

export const sourceWriterPlugin = (
  engine: EngineDelegate,
  dispatch: (action: Action) => void
) => {
  const textSourceWriter = new PCSourceWriter({ engine });

  const onVirtualStyleDeclarationValueChanged = (
    action: VirtualStyleDeclarationValueChanged
  ) => {
    dispatch(
      pcSourceEdited(
        textSourceWriter.getContentChanges([
          {
            targetId: action.payload.declarationId,
            action: {
              kind: PCMutationActionKind.CSS_DECLARATION_CHANGED,
              name: action.payload.name,
              value: action.payload.value
            }
          }
        ])
      )
    );
  };

  const handleVirtObjectEdited = async (action: PCVirtObjectEdited) => {
    dispatch(
      pcSourceEdited(
        textSourceWriter.getContentChanges(action.payload.mutations)
      )
    );
  };

  return (action: Action) => {
    switch (action.type) {
      case ActionType.PC_VIRT_OBJECT_EDITED: {
        return handleVirtObjectEdited(action);
      }
      case ActionType.VIRTUAL_STYLE_DECLARATION_VALUE_CHANGED: {
        return onVirtualStyleDeclarationValueChanged(action);
      }
    }
  };
};
