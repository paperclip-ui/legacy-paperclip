const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const mode =
  process.env.NODE_ENV === "production" ? "production" : "development";

const API_HOST =
  mode === "development" ? "localhost:3001" : "playground.api.paperclip.dev";

const DEV_OAUTH_CLIENT_IDs = {
  github: "2cdbfa6c949f0c8cd3f5"
};

const PROD_OAUTH_CLIENT_IDs = {
  github: "1c47b5853e6d87769161"
};

const OAUTH_CLIENT_IDs =
  mode === "production" ? PROD_OAUTH_CLIENT_IDs : DEV_OAUTH_CLIENT_IDs;

module.exports = {
  mode,
  entry: "./src/frontend/entry.tsx",

  output: {
    filename: "browser.js",
    path: path.resolve(__dirname, "dist")
  },
  experiments: {
    asyncWebAssembly: true
  },
  devtool: false,

  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      publicPath: "/",
      title: "Paperclip Playground",
      template: path.join(__dirname, "src", "index.html")
    }),
    new webpack.DefinePlugin({
      "process.env.API_HOST": JSON.stringify(API_HOST),
      "process.env.GITHUB_CLIENT_ID": JSON.stringify(OAUTH_CLIENT_IDs.github)
    })
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      os: "os-browserify/browser",
      url: require.resolve("url"),
      path: require.resolve("path-browserify"),
      events: require.resolve("events"),
      react: require.resolve("react"),
      "react-dom": require.resolve("react-dom")
    }
  },
  externals: {
    chokidar: "{}",
    fs: "{}"
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        loader: "ts-loader",
        include: [path.resolve(__dirname, "src"), path.resolve(__dirname, "..")]
      },
      {
        test: /\.pc$/,
        loader: "paperclip-loader",
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "..")
        ],
        options: {
          config: require("./paperclip.config.json")
        }
      },
      {
        test: /\.css$/,
        use:
          mode === "production"
            ? [MiniCssExtractPlugin.loader, "css-loader"]
            : ["style-loader", "css-loader"]
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
  }
};
