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
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"]
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

      console.log(config.resolve);

      return {
        experiments: {
          asyncWebAssembly: true
        },
        module: {
          rules: [
            {
              test: /(glob$|fsevents|readdirp|chokidar)/,
              loader: "null-loader"
            }
          ]
        },
        externals: {
          chokidar: "[]",
          fs: "[]"
        },
        resolve: {
          alias: {
            os: "os-browserify/browser"
          }
        },
        plugins
      };
    }
  };
};
