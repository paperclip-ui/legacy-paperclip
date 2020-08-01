---
id: getting-started-installation
title: NPM Installation
sidebar_label: NPM Installation 
---

Keep in mind that Paperclip is currently in Alpha, and in the meantime it's limited to [React](https://reactjs.org/). Assuming that you're okay with that, go ahead and `cd` into your project directory, then run:

```sh
npm install paperclip-cli --save-dev
```

Next, run:

```sh
npx paperclip init
```

☝ This will setup a `paperclip.config.json` file that will be used by Paperclip. If you're starting a new project, the `paperclip init` will generate it for you. 

If you've started a new project, you can go ahead and run `npm start` to start the Webpack server. 