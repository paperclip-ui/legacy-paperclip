const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

/*
 * We've enabled HtmlWebpackPlugin for you! This generates a html
 * page for you when you compile webpack, which will make you start
 * developing and prototyping faster.
 *
 * https://github.com/jantimon/html-webpack-plugin
 *
 */

const prodMode = process.env.NODE_ENV === "production";
const devMode = !prodMode;

module.exports = {
  mode: "development",
  entry: "./src/entry.tsx",

  output: {
    filename: "[name]-[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
  },
  devtool: false,

  plugins: [
    new MiniCssExtractPlugin({
      filename: devMode
        ? "[name]-[contenthash].css"
        : "[name]-[contenthash].css",
      chunkFilename: devMode ? "[id].css" : "[id]-[contenthash].css",
    }),
    new HtmlWebpackPlugin({
      publicPath: "/",
      title: "Paperclip",
      template: path.resolve(__dirname, "src", "index.html"),
    }),
    new webpack.ProvidePlugin({
      process: "process/browser.js",
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
  ],
  externals: {
    chokidar: "{}",
    fs: "{}",
  },
  experiments: {
    asyncWebAssembly: true,
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        loader: "ts-loader",
        include: [path.resolve(__dirname, "src")],
        exclude: [],
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

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
    },
    alias: {
      os: "os-browserify/browser",
    },
  },

  optimization: {
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    runtimeChunk: true,
    minimize: prodMode,

    splitChunks: {
      maxInitialRequests: Infinity,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
        },
      },

      chunks: "all",
      minChunks: 1,

      // make sure that chunks are larger than 400kb
      minSize: 1000 * 200,

      // make sure that chunks are smaller than 1.5 MB
      maxSize: 1000 * 1500,
      name: false,
    },
  },
};
