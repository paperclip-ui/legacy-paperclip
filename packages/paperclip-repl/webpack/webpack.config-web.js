const path = require("path");
const { config, BASE_DIR } = require("./webpack.config-base");

module.exports = {
  ...config,
  entry: "./src/entry.tsx",
  output: {
    filename: "[name]-[contenthash].js",
    path: path.resolve(BASE_DIR, "dist"),
    publicPath: "/"
  }
};
