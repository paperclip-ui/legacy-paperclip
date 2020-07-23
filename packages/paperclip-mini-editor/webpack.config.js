const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

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
  entry: {
    index: "./src/entry.tsx"
  },

  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist")
  },
  devtool: false,

  plugins: [
    new HtmlWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, "node_modules/paperclip/dist") }
      ]
    })
  ],

  externals: {
    glob: "{}",
    fs: "{}",
    fsevents: "{}",
    readdirp: "{}",
    "glob-parent": "{}",
    chokidar: "{}"
  },
  module: {
    // I also left out the defaultRule for .esm files
    // since it had conditional values
    defaultRules: [
      {
        type: "javascript/auto",
        resolve: {}
      },
      {
        test: /\.json$/i,
        type: "json"
      }
    ],
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
        test: /\.(png|jpe?g|gif|wasm)$/i,
        use: [
          {
            loader: "file-loader"
          }
        ]
      }
    ]
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  }
};
