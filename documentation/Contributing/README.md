#### Prerequisites

- [Rust](https://www.rust-lang.org/)
- [Wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
- [NodeJS](https://nodejs.org/en/)

#### Setting up this repository locally

Here's a simple command you can use to set up the repository locally:

```
git clone git@github.com:crcn/paperclip.git
cd paperclip
yarn install
```

From there, you can start the build server:

```

# needs to be called first
yarn build
yarn build:watch
```

☝🏻This will build all packages & examples.

<!-- #### Package Overview

- [papercip](../packages/paperclip) - this is contains the paperclip language, and runtime.
- [paperclip-cli](../packages/paperclip-cli) - CLI tools
- [paperclip-loader](../packages/paperclip-loader) - Webpack loader
- [paperclip-react-compiler](../packages/paperclip-react-compiler) - React compiler target
- [paperclip-web-renderer](../packages/paperclip-web-renderer) - browser renderer for previews.
- [paperclip-vscode-extension](../packages/paperclip-vscode-extension) - VS Code extension. -->