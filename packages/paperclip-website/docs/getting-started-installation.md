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

☝🏻 This will ask you a few questions. After that, you'll have a `paperclip.config.json` that will be used to compile
your Paperclip files.
