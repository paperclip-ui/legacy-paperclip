---
id: getting-started-webpack
title: Configuring Webpack
sidebar_label: Webpack
---

Paperclip works with Webpack 4 and 5. To get started, install these dependencies:

```
npm i paperclip-compiler-react paperclip-loader --save-dev
```

Next, in the same directory as `webpack.config.js`, copy this content to `paperclip.config.json`:

```javascript
{
  "compilerOptions": {
    "name": "paperclip-compiler-react"
  },
  "sourceDirectory": "./src"
}

```

> `sourceDirectory` is where your `*.pc` files go. More docs on this config can be found [here](configure-paperclip).

Next, update your Webpack config to look something like this:

```javascript
module.exports = {
  module: {
    // ... 
    rules: [

      // ...

      {
        test: /\.pc$/,
        loader: "paperclip-loader",
        options: {

          // config for your Paperclip files
          config: require("./paperclip.config.json")
        }
      },


      // CSS loaders required to load styles
      {
        test: /\.css$/i,

        use: ["style-loader", "css-loader"],

        // this also works too
        // use: [MiniCssExtractPlugin.loader, "css-loader"]
      },

      // Highly recommend
      {
        test: /\.(png|jpe?g|gif|ttf|svg)$/i,
        use: [
          {
            loader: "file-loader"
          }
        ]
      }
    ],
  },
};
```

> If you want to see an example of this, check out the [Paperclip playground webpack.config.js](https://github.com/crcn/paperclip/blob/master/packages/paperclip-playground/webpack.config.js#L62)

Paperclip requires that you use [css-loader](https://webpack.js.org/loaders/css-loader/) in order to work, and either the [style-loader](https://webpack.js.org/loaders/style-loader/), or [mini-css-extract-plugin](https://webpack.js.org/plugins/mini-css-extract-plugin/) to go with that. It's also recommended that you include [url-loader](https://webpack.js.org/loaders/url-loader/) or [file-loader](https://webpack.js.org/loaders/file-loader/) in your webpack config so that you can import images, and other assets into your Paperclip files.

After that, you can start using Paperclip in your project! I'd recommend installing the [visual tooling](visual-tooling) next, then checking out the [React docs](usage-react#importing-pc-files) on how to use Paperclip in your React app.