---
id: getting-started-cra
title: Create React App
sidebar_label: Create React App
---

<!-- TODO: #891 -->

This is the setup process for CRA if you're using that in your project.

Paperclip works with Webpack 4 and 5. To get started, install these dependencies:

```
npm i @paperclipui/compiler-react @paperclipui/loader --save-dev
```

Next, in the same directory as `package.json`, copy this content to `paperclip.config.json` :

```javascript
{
  "srcDir": "./src"
}

```

> `srcDir` is where your `*.pc` files go. More docs on this config can be found [here](configure-paperclip).

Next, 

If you're using CRA, then just run `yarn paperclip build` in your project directory to emit JS files. After that, you can import any component like so: 

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
    "start": "concurrently \"react-scripts start\" \"paperclip build --watch\""
  },
  "devDependencies": {
    "concurrently": "^5.3.0",
  }
}
```

☝ This will start the Paperclip compiler in parallel with your usual start script. 

Here's a walkthrough: 

![CRA walkthrough](/img/cra-walkthrough.gif)
