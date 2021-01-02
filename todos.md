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