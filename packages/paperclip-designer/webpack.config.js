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

const prodMode = process.env.NODE_ENV === "production";

module.exports = {
  mode: "development",
  entry: "./src/entry.tsx",

  output: {
    filename: "[name]-[contenthash].js",
    path: path.resolve(__dirname, "dist")
  },
  devtool: false,

  plugins: [
    new MiniCssExtractPlugin({
      filename: devMode ? "[name].css" : "[name]-[contenthash].css",
      chunkFilename: devMode ? "[id].css" : "[id]-[contenthash].css"
    }),
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
        use: [MiniCssExtractPlugin.loader, "css-loader"]
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
  },

  optimization: {
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    runtimeChunk: true,
    minimize: prodMode,

    splitChunks: {
      maxInitialRequests: Infinity,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/
        }
      },

      chunks: "all",
      minChunks: 1,

      // make sure that chunks are larger than 400kb
      minSize: 1000 * 200,

      // make sure that chunks are smaller than 1.5 MB
      maxSize: 1000 * 1500,
      name: false
    }
  }
};
