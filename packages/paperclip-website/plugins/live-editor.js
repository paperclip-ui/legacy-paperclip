const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

module.exports = function(context, options) {
  return {
    name: "paperclip-live-editor",
    getThemePath() {
      return path.resolve(__dirname, "./theme");
    },
    configureWebpack(config, isServer) {
      const plugins = [
        new CopyPlugin({
          patterns: [
            {
              from: path.resolve(
                __dirname,
                "../node_modules/paperclip-mini-editor/dist"
              )
            }
          ]
        })
      ];

      if (isServer) {
        plugins.push(
          new webpack.ProvidePlugin({
            TextDecoder: ["util", "TextDecoder"],
            TextEncoder: ["util", "TextEncoder"]
          })
        );
      }

      return {
        node: {
          fs: "empty"
        },
        module: {
          rules: [
            {
              test: /(glob$|fsevents|readdirp|chokidar)/,
              loader: "null-loader"
            }
          ]
        },
        plugins
      };
    }
  };
};
