IMMEDIATE:

- atoms
  - co-locate into atoms.pc
  - atoms.pc should be included wherever colors are used (check styles)
  
- Need to consider other entry points into DS

- download atoms
  - typography
  - shadows
  - colors

- include atomic mixins within style blocks where they overlap
- create components based on styles
- convert component sets to components w/ variants
  - need to be considerate of child overrides. Make all children overridable?
  - need to be considerate of style overrides. pass classNames to all layers


#### Considerations

- need to use _explicit_ styles that won't change. Possibly safe place for designers
to define styles
- some way to reference children. E.g: allowing designers to replace a logo, vector images.
  - this could work simply by referring to any style
- ensuring that references to particular layers are maintained
  - need to include ID with reference unfortunately


#### DX todos

- need to enable meta + click with mixins






- use style atoms
- consolidate instance styles together

- layers shouldn't use mixins - should use atoms instead 
- download assets


Avocode sync:
  - convert artboard to PC
  - export mixins
  - export tokens
  - download vectors
  - 
