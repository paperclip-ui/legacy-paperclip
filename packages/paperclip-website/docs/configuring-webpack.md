---
id: configuring-webpack
title: Setting up Webpack
sidebar_label: Webpack setup
---

You can use Paperclip with [Webpack](https://webpack.js.org/) by installing the loader:

```sh
npm install paperclip-loader --save-dev
```

Also, be sure that you also have the following dependencies installed:

```sh
npm install style-loader css-loader file-loader --save-dev
```

> The reason for this is that Paperclip emits CSS files that need to be loaded.

After that, you can set can include `paperclip-loader` in your webpack config rules:

```javascript
{
  test: /\.pc$/,
  loader: "paperclip-loader",
  options: {
    
    // paperclip.config.json can be generated via the paperclip-cli tool
    config: require("./paperclip.config.json")
  }
}
```

> ☝🏻be sure that you have a [paperclip.config.json](configuring-paperclip.md) file.

For context, here's what your entire Webpack config might look like:

```javascript
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.pc$/,
        loader: "paperclip-loader",
        options: {
          
          // paperclip.config.json can be generated via the paperclip-cli tool
          config: require("./paperclip.config.json")
        }
      },

      // Required since paperclip-loader emits
      // CSS files
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: ["file-loader"]
      }
    ]
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  }
};
```

That's it! from there you can start using Paperclip in your UIs. For example:

```html
<style>
  .Message {
    font-size: 24px;
  }
</style>
<div export component as="Counter" className="Counter">
  {children}
  <button onClick={onIncrementClick}>
    increment
  </button>
</div>
```

Can be used in React like so:

```javascript
import * as ui from "./counter.pc";
import React, {useState} from "react";

const Counter = () => {
  cconst [currentValue, setCurrentValue] = useState(0);
  const onIncrementClick = () => setCurrentValue(curentValue + 1);
  return <ui.Counter onIncrementClick={onIncrementClick}>
    {currentValue}
  </ui.Counter>
};
```