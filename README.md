![Checks](https://github.com/crcn/paperclip/workflows/Checks/badge.svg?branch=master)

<br />

<div style="text-align: left; margin-bottom: 32px;">
  <img src="assets/logo-outline-5.png" width="400">
</div>

<!-- ✨ **Wanna kick the tires around a bit? Check out the [Playground](http://playground.paperclip.dev)!** ✨ -->


Paperclip is a tiny language that helps you write _durable_ HTML & CSS that can be used in any language. Here's what it looks like:

```html

<!-- this style block is scoped to the document that it's defined in -->
<style>
  .font-regular {
    font-family: Inter;
    font-size: 0.8em;
  }
</style>

<div export component as="Message" className="font-regular">
  {children}
</div>
```

Here an example of how you can use this HTML & CSS in a React app:

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { Message } from "./my-module.pc";

ReactDOM.render(<Message>
  Hello Paperclip!
</Message>, document.body);
```

### Why?

Writing scalable HTML & CSS is _hard_, and it's easy for codebases to wind up in an unmaintainable state where developers are reluctant to make any changes to the UI. Paperclip was created as a way to combat this.

### Features

- **No global CSS**. With Paperclip, CSS is scoped to the document it's defined in, so you don't have to worry about styles leaking out. 
- **Fewer CSS bugs**. Paperclip comes with visual regression tooling that allows you to easily track _all_ visual changes in Paperclip files, so you can feel comfortable making big change without breaking production. 
- **Use existing knowledge**. Paperclip is basically HTML & CSS with a few additional features, so you can get started using Paperclip pretty quickly. 
- **Compile to any language you want**. Paperclip compiles down to vanilla code, and can be imported into whatever language or framework you want.
- **Live previews**. Paperclip comes with developer tooling that allows you to build UIs in realtime. 


## Resources

<!-- - [Playground](http://playground.paperclip.dev) - Play around with Paperclip, share, download React code directly from the browser.
- Examples
  - [Paperclip website](./packages/paperclip-website)
  - [Paperclip playground](./packages/paperclip-website)
  - [Welcome tutorial](https://playground.paperclip.dev/s/Wn28KiQnlJS0alw2gqmem)
  - [Bulma CSS demo](https://playground.paperclip.dev/s/qCTb5bIRINgESxdyMH2tr)
  - [Tailwind CSS demo](https://playground.paperclip.dev/s/BDqOoNKyneeEEyZ3ygi6x) -->
- [Slack channel](https://join.slack.com/t/paperclipglobal/shared_invite/zt-o6bbeo6d-2zdyFdR5je8PjCp6buF_Gg) - for questions, feedback, help, or whatever! 
- Installation
  - [Project installation](https://paperclip.dev/docs/) - Basic installation of Paperclip for new and existing projects.
  - [VSCode Extension](https://paperclip.dev/docs/) - Getting started with the VS Code extension.
  - [Webpack setup](https://paperclip.dev/docs/configure-webpack) - Setting up with Webpack
- Documentation
  - [Syntax](https://paperclip.dev/docs/usage-syntax) - How to write Paperclip documents
  - [React usage](https://paperclip.dev/docs/usage-react) - Using Paperclip UIs in your React code



## Sponsors

![index](https://user-images.githubusercontent.com/757408/105444620-254d8d80-5ca9-11eb-97c8-9c0fd66408d4.png)


