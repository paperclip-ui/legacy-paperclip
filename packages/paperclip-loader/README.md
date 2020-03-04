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
        loader: "paperclip-loader"
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

Next, you'll need to setup a `pcconfig.json`:

```javascript
{

  // Options for the specific compiler
  "compilerOptions": {

    // module name of the compiler to use
    "name": "paperclip-react-compiler"
  },

  // Module directories where import statements resolve from.
  "moduleDirectories": ["./src"],

  // File pattern for all of your Paperclip files.
  "filesGlob": "./src/**/*.pc"
}
```

 > Docs for this can be found [here](../../documentation/Paperclip%20Config).
 
 Examples:
 
 - [TodoMVC](../../examples/react-todomvc)
