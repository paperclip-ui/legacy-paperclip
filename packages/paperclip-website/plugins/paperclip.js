module.exports = function(context, options) {
  return {
    name: "@paperclip-ui/plugin",
    configureWebpack(config, isServer) {
      // Disable svg loading in react because it's fooing with CSS. Docusaraus needs to implement
      // Rules.issuer for this, but I'm too lazy to make a PR for that.
      config.module.rules = config.module.rules.filter(rule => {
        if (
          rule.test?.source.includes("svg") ||
          rule.test?.source.includes("ttf")
        ) {
          return false;
        }
        return true;
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
