

For the Alpha version of Paperclip, you'll need this stuff:

- VS Code. If you don't have this, you can use HMR. 
- React
- Webpack

Here's what you can do next:

1. Install the [VS Code extension](https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode-extension).
1. With VS Code open, create a `hello-world.pc` & open it.
1. You'll see a pop up to open a live preview, click OK.
1. Start typing away! You should see a live preview of your text at this point.


You're _almost_ done. Next you'll need to add a `pcconfig.json` file. Here's an example you can use:

```json
{
  "compilerOptions": {
    "name": "paperclip-compiler-react"
  },
  "moduleDirectories": ["./src/ui"],
  "filesGlob": "./src/**/*.pc"
}
```

> Check out the [PC config documentation](../Paperclip%20Config) for more info.

Now you can start using Paperclip! Here's what you can do next:

<!-- - Check out the tutorials -->
- [Check out the Syntax](../Syntax)
- [Setting up Webpack](../Integrations/Webpack)
- [Integrating with React](../Integrations/React)
