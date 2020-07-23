const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.ts"
  },

  devtool: "source-map",
  output: {
    // publicPath: "/",
    library: "__MINI_PC_EDITOR__",
    filename: "mini-editor.bundle.js",
    libraryTarget: "global",
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
    glob: "[]",
    fs: "[]",
    fsevents: "[]",
    readdirp: "[]",
    chokidar: "[]"
  },
  module: {
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
