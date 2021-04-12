---
id: getting-started-installation
title: Project Installation
sidebar_label: Installation
---

This guide assumes that you're using **Webpack** and **React**.

First up, go ahead and run this command in your project directory (existing and new):

```
npx paperclip-cli init
```

### Webpack Setup

Documentation for this can be found in the [Webpack Integration](configure-webpack.md) page. The only thing you really need to configure is:

- `paperclip-loader` - compiles PC files to JSX.
- `style-loader` - required since Paperclip emits CSS.
- `css-loader` - required with style-loader.
- `file-loader` - required for CSS files that have `url()`'s in them & other media. 


### Create React App (CRA)

If you're using CRA, then just run `yarn paperclip build --write` in your project directory to emit JS files. After that, you can import any component like so: 

```javascript
import * as myComponentStyles from "./my-component.pc.js";

<myComponentStyles.MyComponent />
```

I'd recommend that you include this in your `.gitignore` too:

```sh
*.pc.js
*.pc.css
```

Also, to make it easier you can include the build script in your `start` script like so:

```json
{
  "name": "my-app-name",
  "scripts": {
    "start": "react-scripts start & paperclip build --watch --write"
  }
}
```

☝ This will start the Paperclip compiler in parallel with your usual start script. 

Here's a walkthrough: 

![CRA walkthrough](/img/cra-walkthrough.gif)

### TypeScript

If you're using TypeScript, you can generate Typed Definitions from Paperclip files by running:

```bash
yarn paperclip build --definition --write
```

This will write `*.pc.d.ts` files in in the same directory as their corresponding `*.pc` file. I'd also recommend that you include `*.pc.d.ts` in your `.gitignore` file.

☝ This command will generate definitions files based on the compiler you're using. So if you're using `paperclip-compiler-react`, then React
Typed Definition files will be generated for you. Configuration for the compiler can be found in the `paperclip.config.json`. 

<!-- ### NextJS Setup

> ⚠️ WIP ⚠️ -->



