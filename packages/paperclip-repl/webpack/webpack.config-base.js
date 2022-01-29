const path = require("path");

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const BASE_DIR = path.resolve(__dirname, "..");

exports.BASE_DIR = BASE_DIR;

exports.config = {
  mode: "development",
  experiments: {
    asyncWebAssembly: true,
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      publicPath: "/",
      title: "React Demo",
      template: path.resolve(BASE_DIR, "src", "index.html"),
    }),
    new webpack.ProvidePlugin({
      process: "process/browser.js",
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      ),
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      os: "os-browserify/browser",
      crypto: "crypto-browserify",
      constants: "constants-browserify",
    },
  },

  externals: {
    chokidar: "{}",
    "get-port": "{}",
    http: "{}",
    ws: "{}",
    child_process: "{}",
    execa: "{}",
    assert: "{}",
    globby: "{}",
    express: "{}",
    stream: "{}",
    "fs-extra": "{}",
    fs: "{}",
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        loader: "ts-loader",
        include: [path.resolve(BASE_DIR, "src"), path.resolve("..")],
        exclude: [],
      },
      {
        test: /\.pc$/,
        loader: "paperclip-loader",
        include: [path.resolve(BASE_DIR, "src"), path.resolve("..")],
        options: {
          config: require("../paperclip.config.json"),
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|ttf|svg)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
};
