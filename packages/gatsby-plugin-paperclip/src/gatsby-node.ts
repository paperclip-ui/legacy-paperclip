

export function resolvableExtensions() {
  return [`.pc`]
}

export function onCreateWebpackConfig({ loaders, actions }) {
  // We need to use Babel to get around the ES6 export issue.
  
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.pc$/,
          use: [require.resolve(`paperclip-loader`)],
        },
      ],
    },
  });

  
}