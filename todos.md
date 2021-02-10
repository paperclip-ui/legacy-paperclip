- computed style inspector
  - needs to use getComputedCSSStyle
  - needs to link declarations with ASTs
    - on click, go to source code

- start on virtual object inspector
  - start with styles
    - consider :global, :within, nested &
      - a { &--b }
    - come up with list of 

  - needs to inspect actual virtual object - engine.inspectNode(uri, nodePath) {
    styleRules: [
      { selector: "aa", declarations: [{ name: "a", value: "b" }] },
      { selector: "a &--b", declarations: [{ name: "a", value: "b" }] }
    ]
  }