** Need to wait for a few weeks to let current bugs shake out **

#### Re-do website

- make it beta only
- UI for grid view


#### Next

- wire up dev server with vscode - deprecate IPC
  - need to figure out how to get to talk to server - hash IPC based on project pcconfig?
    - what if mulitple configs?
      - this may happen if working with package module
  - server needs to be explicitly defined, I think
- get vscode to check for dev server lock - use that
- pop tab out of vscode 
- file:// needs to work

- grid view!
  - show all UIs

- key combos
  - cmd + t = show grid

- ability to hide gutter

- *need to consider file modifications
  - make read-only until connected with text editor?
    - maybe not considering that user might be using plain text editor

- consider FS changes

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
