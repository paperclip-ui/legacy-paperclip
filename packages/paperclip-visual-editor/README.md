⚠️ note -- need to build tooling out of necessity. Will create
UI around that.


TODOS:

- [ ] Right sidepanel
  - [ ] style inspector tab
    - [ ] display list fo all styles within document, including scoped styles
  - [ ] element inspector tab
    - [ ] display element + currently selected style
    - [ ] display mixins
    - [ ] ability to reference css variables

- [ ] insert element (D key)
- [ ] insert text (T key)
- [ ] display height of elements**

- [ ] box-model controls (margin & padding sizing)
- [ ] zoom in & out
- [ ] abiliy to change font (from file system)
- [ ] ability to change colors
- [ ] measurement tools
- [ ] grid tools
- [ ] possibly using doc-comments to add metadata about screens
- [ ] linting
  - [ ] warning when magic colors are used in doc

Considerations:

- [ ] will need to evaluate ASTs of selected elements for styles
- [ ] Mixins 
- [ ] Imports
- [ ] nested style rules
- [ ] components vs preview elements
- [ ] ability to define variants
- [ ] css specificty
- [ ] exportable properties
- [ ] ability to define class names on element
- [ ] 


Ideas:

- stick to just the computed output, and leave the details to code. 

Rules around editing CSS:

- edit style rule that appears first in `className`
- if edited className is selecting multiple _unique_ elements (not instances), then create a new style rule and prepend that to `className`