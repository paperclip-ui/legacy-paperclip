const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

module.exports = function(context, options) {
  return {
    name: "paperclip-plugin",
    configureWebpack(config, isServer) {
      return {
        module: {
          rules: [
            {
              test: /\.pc$/,
              loader: "paperclip-loader",
              options: {
                config: require("../paperclip.config.json")
              }
            },
            // {
            //   test: /\.ppp$/,
            //   use: [MiniCssExtractPlugin.loader, "css-loader"]
            // },
            {
              test: /\.(png|jpe?g|gif|ttf)$/i,
              use: [
                {
                  loader: "file-loader"
                }
              ]
            }
          ]
        }
      };
    }
  };
};
