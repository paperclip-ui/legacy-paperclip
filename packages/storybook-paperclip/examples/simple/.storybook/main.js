const path = require("path");

module.exports = {
  stories: ["../src/**/*.pc"],
  addons: [
    "@storybook/addon-actions",
    "@storybook/addon-links",
    path.resolve(__dirname, "../../../")
  ],
  webpackFinal: async config => {
    // do mutation to the config

    console.log(config);

    config.module.rules.push({
      test: /\.pc$/,
      loader: require.resolve("./loader.js"),
      include: [path.resolve(__dirname, "src")],
      exclude: [/node_modules/],
      options: {
        config: {}
      }
    });

    return config;
  }
};
