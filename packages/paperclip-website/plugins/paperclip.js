const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

module.exports = function(context, options) {
  return {
    name: "paperclip-plugin",
    configureWebpack(config, isServer) {
      // Disable svg loading in react because it's fooing with CSS. Docusaraus needs to implement
      // Rules.issuer for this, but I'm too lazy to make a PR for that.
      config.module.rules = config.module.rules.filter(rule => {
        return String(rule.use).indexOf("@svgr/webpack?-prettier-svgo") !== 0;
      });

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
            {
              test: /\.(ttf|svg)$/i,
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
