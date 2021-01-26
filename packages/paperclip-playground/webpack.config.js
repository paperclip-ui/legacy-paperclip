const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const mode =
  process.env.NODE_ENV === "production" ? "production" : "development";

const prodMode = mode === "production";
const API_HOST =
  mode === "development" ? "localhost:3001" : "playground-api.paperclip.dev";

const standalone = process.env.PLAYGROUND_STANDALONE != null;

const DEV_OAUTH_CLIENT_IDs = {
  github: "2cdbfa6c949f0c8cd3f5"
};

const PROD_OAUTH_CLIENT_IDs = {
  github: "1c47b5853e6d87769161"
};

const OAUTH_CLIENT_IDs = prodMode
  ? PROD_OAUTH_CLIENT_IDs
  : DEV_OAUTH_CLIENT_IDs;

const plugins = [
  new HtmlWebpackPlugin({
    publicPath: "/",
    title: "Paperclip Playground",
    template: path.join(__dirname, "src", "index.html")
  }),
  new webpack.ProvidePlugin({
    process: "process/browser"
  }),
  new webpack.DefinePlugin({
    "process.env.API_HOST": JSON.stringify(API_HOST),
    "process.env.GITHUB_CLIENT_ID": JSON.stringify(OAUTH_CLIENT_IDs.github)
  })
];

plugins.push(new MiniCssExtractPlugin());

if (standalone) {
  plugins.push(
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    })
  );
}

module.exports = {
  mode,
  entry: "./src/frontend/entry.tsx",

  output: {
    filename: "paperclip-playground-[name]-[contenthash].js",
    path: standalone
      ? path.resolve(__dirname, "standalone-dist")
      : path.resolve(__dirname, "dist"),
    publicPath: "/"
  },
  experiments: {
    asyncWebAssembly: true
  },
  devtool: false,

  plugins,
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
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.(png|jpe?g|gif|ttf|svg)$/i,
        use: [
          !prodMode
            ? {
                loader: "url-loader",
                options: {
                  limit: Infinity
                }
              }
            : {
                loader: "file-loader"
              }
        ]
      }
    ]
  },
  optimization: standalone
    ? {
        minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
        minimize: prodMode
      }
    : {
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
