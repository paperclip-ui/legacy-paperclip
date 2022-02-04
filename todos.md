- may need to use inferencing engine

- prohibit children from being inserted into instances without `{children}`
- when dropping onto stage, only highlight instable areas (top-level instances, and slots)
- imported docs should be relative
- slots
  - tag slots based on shape
    - `{}` = null
    - `{a && b}` = variantOffSlot
    - `{a || b}` = slotWithDefault
    - `{a && b || c}` = conditionalSlot
    - `{!a && b}` = variantOnSlot
    - `{(a && b || c) || c}` = invalid
  - display name of slot  
    - store as metadata

## Immediate

- quickfind
  - ability to show & hide
  - Load all components found in AST that are exported
    - should be part of language service
  - when element is selected, store selection in local state

- when insertion is selected in local state, clicking canvas should insert element
  - should only work with canvas for now
  - should auto-import element
  - should identify element that is hovered, and insert into that


## Acceptance

- should be able to create any UI from existing design system
- should be able to remove elements
- should be able to drag elements around

