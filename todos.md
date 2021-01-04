** Need to wait for a few weeks to let current bugs shake out **

#### Re-do website

- make it beta only
- UI for grid view


#### Next

- wire up vscode with dev server
  - will need to assign IDs to preview instances
- pop tab out of vscode (into Firefox)
- grid view of all UIs
- show opened files
- ability to open text editor

#### Considerations

- Grid view
- grid view frame performance? 
- needs to be a standalone app
- expose RPC server for updating docs
- allow for remote http preview
- update vscode extension to use PC server
- PC server should emit screenshots? Maybe live? Should be performant?
- show frames with components
- re-use for QA?


### CSS evaluator mini revamp

---

- :within(.selector)
- :within(.selector), .selector == ._scope_id_selector [data-scope-id], [data-scope-id] .selector
- :not(:within(.selector)) == :not(._scope_id_selector) [data-scope-id]
- :within(:not(.selector)) == :not(._scope_id_selector) [data-scope-id]
- :global(:within(.selector)) == .selector [data-scope-id]
- :global(:not(:within(.selector)))
- :self(:within(.selector)) 
- parent { child { }}
- :within(.selector) { &--child { }} == ._scope_id_selector [data-scope-id]--child
- :within(.selector) { &.child { }} == ._scope_id_selector [data-scope-id][class].child
- :within(.selector) { .child { }} == ._scope_id_selector [data-scope-id] [data-document-id][class].child

---

- Looking at selector writer 
- :within(:not())
  - document_selector = not()
  - scope_selector = data-pc-scope-id
  - target_selector = null
- :within(selector).div 
- div:within(span)
  - document_selector = span
  - scope_selector = null
  - target_selector = div
- :self(.div) 
  - document_selector = null
  - scope_selector = null
  - target_selector = [data-pc-scope-id].div
- &.div 
  - document_selector = null
  - scope_selector = null
  - target_selector = [data-pc-scope-id].div
- :self { &.div { }}
  - document_selector = null
  - scope_selector = null
  - target_selector = [data-pc-scope-id].div
- :self { .div { }}
  - document_selector = null
  - scope_selector = null
  - target_selector = [data-pc-scope-id] div

- a {
  :within(b) {
    c {
      color: red
    }
  }
  c {

  }
}
  - 
    - scope = b
    - target = a c
  -
    - scope = null
    - target = a c

- (scoped) div {
  &.a {
  }
}
  - scope = [data-pc-element-scope-id]
  - target = div.a 
  
- (scoped) div {
  .a {
  }
}
  - scope = el scope
  - target = div .a

- div {
  .a & {

  }
}
  - scope = el scope
  - parent = null
  - target = .a div
  - ** & needs to be identified within a group 
  - included_parent = true - flag if & is written

- span { div { .a { color: red }} }
  - scope = null
  - parent = span div
  - target = .a

- span { &.variant { .a { color: red }} }
  - scope = null
  - parent = span.variant
  - target = .a

- (scoped) span { &.variant1:within(.variant2) { &.a { color: red }} }
  - scope = .variant2 [data-element-id]
  - parent = null
  - target = span.variant1.a

- :self(:not(:within(.div))) {
  div {
    color: red;
  }
}
  - call self() param
    - call not() param
      - return { scope: .div }
      - need to figure out signal parent to prepend - if scope is found, prepend
      - return { scope: :not(div) }
    - scope found in param, so prepend
      - { scope: :not(.div) [data-pc-element] }
  - pass to child { scope: not(within), parent:  }
  - scope = .div

- div {
  :not(&.variant) {

  }
}

- :self {
  &:within(.div) {

  }
}

  - & found  - target = parent
  - :within found, set scope to .div
  - scope = .div
  - target = [data-element-id]



- :within(.variant) {
  &.a, &.b {

  }
}

  - needs to emit multiple style rules

- (scoped) && {
  color: red;
}
  - parent not present, to use scope for &&

- (scoped) :within(div) {
  && {
    color: red;
  }
}
  - parent not present, so use scope for within
  - take scope and use as parent - what about multiple withins?

- (scoped) :within(a) { :within(b) {
  && {
    color: red;
  }
  div {
    color: orange;
  }
}}

  - parent not present in first :within
  - second within params = { scope: "a", parent: [data-element-id] }
    - prefix scope with "b", keep parent
  - && found, take parent and use as target - remove parent
  - div found, set as target = output = b a [data-element-id] div


- :within(a, b, c) {

}

- :global(a, b, c) {
  
}