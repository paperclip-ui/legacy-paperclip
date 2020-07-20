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

☝🏻 This will setup a `paperclip.config.json` file that will be used by Paperclip. If you're starting a new project, the `paperclip init` will also walk you through the entire setup process. 