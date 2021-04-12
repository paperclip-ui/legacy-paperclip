---
id: visual-tooling
title: Visual Tooling
sidebar_label: Visual Tooling
---

Paperclip comes with visual tooling that allows you to see your UI changes instantly.

There are two options:

1. For VS Code users, you can install the [extension](https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode).
1. For non-vscode users, you can install the [CLI tools](#cli-dev-server).


### VS Code extension

I highly recommend using the [VS Code extension](https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode) since you can launch previews directly from the IDE, and changes appear _as you type_.  


![alt Realtime editing](/img/vscode-measure.gif)

Check out the [VS Code extension guide](guide-vscode) for more info.

### CLI dev server

If you don't have VS Code, you can just run the CLI tool:

```
npx paperclip dev
```

This will launch Paperclip's visual tooling in the browser. Changes that are saved locally will appear immediately here. 


![alt Realtime editing](/img/demo-dev-server.gif)

> Note that there are some limitations to the dev server. For example, you won't be able to move frames around, and you won't be able to jump to source code via `meta + click`. That functionality is only available for the IDE extensions.