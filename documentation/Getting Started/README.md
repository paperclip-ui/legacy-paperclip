

For the Alpha version of Paperclip, you'll need this stuff:

- VS Code. If you don't have this, you can use HMR. 
- React
- Webpack

Here's what you can do next:

1. Install the [VS Code extension](https://marketplace.visualstudio.com/items?itemName=crcn.tandem).
1. With VS Code open, create a `src/hello-world.pc` & open it.
1. You'll see a pop up to open a live preview, click OK.
1. Start typing away! You should see a live preview of your text at this point.


You're _almost_ done. Next you'll need to set up the build tools. For that, run `npm install paperclip-cli --save-dev`. Then run:

```
npx paperclip init
```

☝🏻 This will ask you a few questions. Then after that, you'll have a `pcconfig.json` that the CLI tool will for compiling JavaScript code. 

> [The CLI main README has more documentation](../../packages/paperclip-cli)

Now you can start using Paperclip! Here's what you can do next:

<!-- - Check out the tutorials -->
- [Integrating with React](../../packages/paperclip-compiler-react)
- [Setting up Webpack](../../packages/paperclip-loader)
- [Check out the Syntax](../Syntax)
