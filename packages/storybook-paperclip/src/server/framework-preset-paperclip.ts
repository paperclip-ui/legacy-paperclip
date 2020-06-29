import { Configuration } from "webpack"; // eslint-disable-line

export function webpack(config: Configuration) {
  console.log(process.cwd());
  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        ,
        {
          test: /\.pc$/,
          loader: "paperclip-loader",
          exclude: [/node_modules/],
          options: {
            compilerOptions: {
              name: "paperclip-compiler-react"
            },
            moduleDirectories: ["./src"],
            filesGlob: "./src/**/*.pc"
          }
        }
      ]
    },
    resolve: {
      ...config.resolve,
      extensions: [...config.resolve.extensions, ".pc"],
      alias: config.resolve.alias
    }
  };
}
