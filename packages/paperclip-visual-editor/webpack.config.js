const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

/*
 * We've enabled HtmlWebpackPlugin for you! This generates a html
 * page for you when you compile webpack, which will make you start
 * developing and prototyping faster.
 *
 * https://github.com/jantimon/html-webpack-plugin
 *
 */

module.exports = {
  mode: "development",
  entry: "./src/entry.tsx",

  output: {
    filename: "browser.js",
    path: path.resolve(__dirname, "dist")
  },
  devtool: false,

  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      title: "Paperclip",
      template: path.resolve(__dirname, "src", "index.html")
    }),
    new webpack.ProvidePlugin({
      process: "process/browser"
    })
  ],
  externals: {
    chokidar: "{}"
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        loader: "ts-loader",
        include: [path.resolve(__dirname, "src")],
        exclude: [/node_modules/]
      },
      {
        test: /\.pc$/,
        loader: "paperclip-loader",
        include: [path.resolve(__dirname, "src")],
        exclude: [/node_modules/],
        options: {
          config: require("./paperclip.config.json")
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpe?g|gif|ttf|svg)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: Infinity
            }
          }
        ]
      }
    ]
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      os: "os-browserify/browser"
    }
  }
};
