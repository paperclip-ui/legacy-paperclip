---
id: getting-started-vscode
title: Installing the visual editor
sidebar_label: Visual Tooling setup
---

Paperclip's visual tooling is a good place to start for you to get a good feel for the template language. 

## VS Code

The [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode) is a really good place to start since it works out of the box. Just create a new `hello-world.pc` file, and start writing plain HTML & CSS. Play around by creating a style block, use the color pickers.  Get a real good feel for Paperclip. 

![alt Realtime editing](/img/vscode-measure.gif)

### Tips

- To **Open a live preview**, execute the `Paperclip: Live Preview` while a `*.pc` file is open.
- To **zoom**, scroll & hold down the `meta` / `ctrl` key.
- To **measure between elements**, just select an element, then hold `meta` / `ctrl` by hovering over another element.
- You can **turn off visual tools** by clicking the raindrop. 
- You can open the **web inspector** by running the command: `Developer: Open Webview Developer tools`.
- If the extension stops working for whatever reason (might happen during Alpha), then run the `Developer: Reload Window` command. 

## Dev server

If you don't have VS Code, you can install the CLI tool:

```
npm i paperclip-cli -g
```

After that, create a new `hello-world.pc` and type some HTML into that. Once that's done, open terminal and run:

```
paperclip dev
```

☝🏻 this will start the dev server that will allow you to visually see your frames *live* as you're building them.

