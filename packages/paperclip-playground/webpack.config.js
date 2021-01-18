const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");

const mode =
  process.env.NODE_ENV === "production" ? "production" : "development";

const API_HOST =
  mode === "development" ? "localhost:3001" : "playground.api.paperclip.dev";

module.exports = {
  mode,
  entry: "./src/frontend/entry.tsx",

  output: {
    filename: "browser.js",
    path: path.resolve(__dirname, "dist"),
  },
  experiments: {
    asyncWebAssembly: true,
    // asyncWebAssembly: true
  },
  devtool: false,

  plugins: [
    new HtmlWebpackPlugin({
      title: "Paperclip Playground",
      template: path.join(__dirname, "src", "index.html"),
    }),
    new webpack.DefinePlugin({
      "process.env.API_HOST": JSON.stringify(API_HOST),
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      os: "os-browserify/browser",
      url: require.resolve("url"),
      path: require.resolve("path-browserify"),
      events: require.resolve("events"),
      react: require.resolve("react"),
      "react-dom": require.resolve("react-dom"),
    },
  },
  externals: {
    chokidar: "{}",
    fs: "{}",
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        loader: "ts-loader",
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, ".."),
        ],
      },
      {
        test: /\.pc$/,
        loader: "paperclip-loader",
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, ".."),
        ],
        options: {
          config: require("./paperclip.config.json"),
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|ttf|svg)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: Infinity,
            },
          },
        ],
      },
    ],
  },
};
