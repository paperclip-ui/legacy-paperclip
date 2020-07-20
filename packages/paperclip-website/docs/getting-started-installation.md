---
id: getting-started-installation
title: Installing Paperclip
sidebar_label: Installation 
---

Paperclip is currently in Alpha, so in the meantime it's limited to small set of tooling:

- [VS Code](https://code.visualstudio.com/) - needed for realtime editing.
- [React](https://reactjs.org/) - currently the only compile target for Paperclip.
- [Webpack](https://webpack.js.org/)

Assuming you can use _all_ of the stuff ☝🏻, go ahead and `cd` into your project directory, then run:

```sh
npm install paperclip-cli --save-dev
```

Then run:

```sh
npx paperclip init
```

☝🏻 I'd recommend calling this in an empty directory first. Paperclip will identify that as a new project 
& walk you through the entire setup. Once you've done that, you can start using Paperclip!

> If you call `paperclip init` within an existing project, Paperclip will just create a `paperclip.config.json` file
for you. The rest of the setup would have to be manually done.
