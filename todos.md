- MVP


Interim compiler TODO:

- attach CSS IDs to elements
  - identify inject-styles from imports
  - translate class names


tooling MVP:

- ability to insert elements & text
  - ability to insert elements into slots (need to attach metadata to container elements)
  - ability to insert component instances
    - throw props pane
    - through canvas (not always possible though)
- ability to insert new style declarations
  - this doesn't take CSS mixins into consideration
  - changes to CSS declarations must only be applied to style rule visible in editor

Slot insertion variations:

- {a && <span>{a}</span>}
- {a || <span>{b}</span>}
  - how do we display this initial state in the UI? In the canvas?
    - we can render this in the tree view. Will need to display component instance
      - tree view will need to render AST + VDOM instead of just VDOM.
        - what about for repeated lists?

online MVP:
  - QA process
    - ability to add comments to elements
      - PC needs to attach this information to vnode path of specific branch
    - visual regression tests
    - Github PR badge
  - monaco editor
    - needs to connect to Docker container!
  - edit in Paperclip GH button
  

bugs:

- sync changed location with the live window


- canvas tooling
  - ability to insert a new element in the canvas
  - ability to insert an element in an element
  - ability to insert text
  - 

- CSS inspector pane
  - computed CSS rules by default
  - ability to edit declaration values 
  - expanded rules 
    - enum for CSS variables (easy)
    - color picker for color vars (more difficult)
    - sliders for units