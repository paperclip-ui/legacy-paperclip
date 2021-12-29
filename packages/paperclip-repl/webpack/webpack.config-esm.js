const path = require("path");
const { config, BASE_DIR } = require("./webpack.config-base");

module.exports = {
  ...config,
  entry: "./src/app.ts",
  output: {
    filename: "main.js",
    libraryTarget: "umd",
    library: "lib",
    path: path.resolve(BASE_DIR, "esm"),
    publicPath: "/"
  }
};
