const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

module.exports = function(context, options) {
  return {
    name: "@paperclipui/live-editor",
    getThemePath() {
      return path.resolve(__dirname, "./theme");
    },
    configureWebpack(config, isServer) {
      const plugins = [
        // new CopyPlugin({
        //   patterns: [
        //     {
        //       from: path.resolve(
        //         __dirname,
        //         "../../@paperclipui/repl/dist"
        //       ),
        //       to: ".",
        //       globOptions: {
        //         ignore: ["**/index.html"]
        //       }
        //     }
        //   ]
        // }),

        new webpack.ProvidePlugin({
          process: "process/browser.js",
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
        resolve: {
          alias: {
            os: "os-browserify/browser"
            // chokidar: "empty-module",
            // fs: "empty-module"
          }
        },
        plugins
      };
    }
  };
};
