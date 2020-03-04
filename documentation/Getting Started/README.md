<!--

TODOS:

- When to use slots
- importing components
- moduleDirectories

-->
## Initial Setup

1. First download the [VS Code extension](https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode-extension). 
1. Open any project, and create a Paperclip file (something like `hello-world.pc`).
1. Open the Paperclip Preview & start typing away!

**What if I don't have VS Code??**

For _now_ you can use Webpack + HMR. For this initial Alpha version though, Paperclip's live preview functionality only works in VS Code. 

## Using the VS Code Extension

TODO:

- meta clicking
- side-by-side comparison
- 


## Setting up Webpack + React

For this step, you'll need to be familiar with Webpack and React

> ✨I'd recommend you take a look at the [React TodoMVC](../../examples/react-todomvc) example to have a better look around how to configure Paperclip with your React app. 

You'll need to install `paperclip-loader`, and `paperclip-react-compiler` as dev dependencies. After that, you'll need a `pcconfig.json` that looks something like:

```json
{
  "compilerOptions": {
    "name": "paperclip-react-compiler"
  },
  "moduleDirectories": ["./src"],
  "filesGlob": "./src/**/*.pc"
}

```

> Documentation for `pcconfig.json` can be found [here](../Paperclip%20Config).

From there, go ahead and set up your `webpack.config.js` file to include the `paperclip-loader`:

```javascript

module.exports = {
  /* ... more config here ... */
  module: {
    rules: [
      {
        test: /\.pc$/,
        loader: "paperclip-loader",
        include: [path.resolve(__dirname, "src")],
        exclude: [/node_modules/],
        options: {
          config: require("./pcconfig.json")
        }
      }
    ]
  }
};

```

#### Generating Typed Definition Files

If you're using TypeScript, then you'll probably want additional type safety around Paperclip files. To do that, you'll need to CLI tools: `yarn add paperclip-cli --dev`. You'll also need to install a compiler. For now, the only option you have is React, so add that: `yarn add paperclip-react-compiler --dev`. After that, you can generate typed definition files like so:

```
./node_modules/.bin/paperclip --compiler=paperclip-react-compiler --definition --write
```


> ⚠️ This command assumes that you have your `pcconfig.json` file set up. If not, refer to the docs above.

> ❓For more information about using the CLI tool, you can check out the [package](../../packages/paperclip-cli). 

> ✨ I also recommend that you include `*.pc.d.ts` in your `.gitignore` file so to keep the typed definition files out of GIT. 

After installing all of the required dependencies & setting up Webpack, you can start writing Paperclip templates! Here's a basic `hello-world.pc` example:

```html
<style>
  span {
    color: pink;
    font-family: Helvetica;
  }
</style>

<!-- this gets exported as the default part -->
<part id="default">
  <span>Hello {message}!</span>
</part>

<preview>
  <default message="World!">
</preview>
```

> For more documentation on syntax, you can [check out this document](../Syntax).

After that creating your first Paperclip file, go ahead and create a corresponding `hello-world.jsx` file, and type in:

```javascript
import React from "react";
import HelloWorldView from "./hello-world.pc";
export default function HelloWorld() {
  return <HelloWorldView message="World" />
}
```

That's all you need! At this point you can start using your Paperclip component. 

> ✨For templates that need logic, I generally just add a corresponding JSX file with the same name. For example, If I have a `this-is-a-component.pc` file, I'd _also_ have a `this-is-a-component.jsx` file. 

If you'd like to see more on how to use Paperclip with React, you can check out these examples:

- [React TodoMVC](../../examples/react-todomvc) - Basic TODO app
- [React Kitchen Sink](../../examples/react-kitchen-sink) - Kitchen sink example using _all_ of Paperclip's features

# More Resources

- [Paperclip Syntax](../Syntax)
- [`pcconfig.json` documentation](../Paperclip%20Config)