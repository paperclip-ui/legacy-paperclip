---
id: guide-modules
title: Writing Paperclip Modules
sidebar_label: Paperclip Modules
---

Paperclip can be modularized for re-usability across packages or NPM. To get started, make sure that you have a [paperclip.config.json](/docs/configure-paperclip)
file in the _same_ directory as your `package.json` file like so:

```sh
packages/
  my-module/
    package.json
    paperclip.config.json
    src/ # source files
```

> ☝ It's important that `paperclip.config.json` is in the same directory as `package.json`, because this is how the Paperclip engine
identify that this is a Paperclip module.

Going back to your _project's_ `paperclip.config.json` file, add a new `moduleDirs` property like so:

```json
{
  "moduleDirs": ["node_modules"]
}
```


Next, assuming that `my-module` is already installed in the `node_modules` directory (via Yarn workspaces or Lerna), you can go ahead and
import your module files into your project. 