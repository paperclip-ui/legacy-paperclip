Installation: `npm install paperclip-loader --save-dev`

This loader allows you use Paperclip files (`*.pc`) in your application code. Here's a basic Webpack example:

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

 Examples:
 
 - [TodoMVC](../../examples/react-todomvc)
