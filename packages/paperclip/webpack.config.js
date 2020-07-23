const path = require("path");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
module.exports = {
  entry: "./browser.js", // input file of the JS bundle
  output: {
    // publicPath: "/",
    filename: "paperclip.bundle.js", // output filename
    libraryTarget: "commonjs-module",
    path: path.resolve(__dirname, "dist") // directory of where the bundle will be created at
  },
  mode: "development",
  externals: {
    glob: "{}",
    fs: "{}",
    fsevents: "{}",
    readdirp: "{}",
    "glob-parent": "{}",
    chokidar: "{}"
  },
  devtool: "source-map",
  module: {
    // rules: [
    //   // {
    //   //   test: /\.(wasm)?$/,
    //   //   loader: "wasm-loader"
    //   // }
    // ]
  },
  plugins: [
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "native")
    })
  ]
};
