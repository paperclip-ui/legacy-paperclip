const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = function(context, options) {
  return {
    name: "paperclip-live-editor",
    getThemePath() {
      return path.resolve(__dirname, "./theme");
    },
    configureWebpack() {
      return {
        externals: {
          glob: "[]",
          fs: "[]",
          fsevents: "[]",
          readdirp: "[]",
          chokidar: "[]"
        },
        plugins: [
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
        ]
      };
    }
  };
};
