![Checks](https://github.com/crcn/paperclip/workflows/Checks/badge.svg?branch=master)

<br />

<div style="text-align: left; margin-bottom: 32px;">
  <img src="assets/logo-outline-5.png" width="400">
</div>

> **Installation**: `npx paperclip-cli init` in your project directory.

<!-- ✨ **Wanna kick the tires around a bit? Check out the [Playground](http://playground.paperclip.dev)!** ✨ -->


Paperclip allows you to write _durable_ HTML & CSS that can be used in just about any codebase. Here's what it looks like:

```html

<style>

  /* This style is scoped, and only applied to this document */
  .font-regular {
    font-family: Inter;
    font-size: 0.8em;
  }
</style>

<!--  
  You can export primitive components that can be used throughout
  your codebase.
-->
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

Paperclip is a separate layer for _just_ your HTML & CSS, and exports _primitive_ components that you can wire up with UI logic in whatever language you want. 

Paperclip files compile down to plain code, and there's no runtime, so you get the performance of your target language, with the added benefits of having scalable HTML & CSS. 

Currently Paperclip compiles to vanilla React code. Other compiler targets for languages such as PHP, Ruby, and Python, are currently in the works. If you'd like to contribute to this, send me a message in [Slack](https://join.slack.com/t/paperclipglobal/shared_invite/zt-o6bbeo6d-2zdyFdR5je8PjCp6buF_Gg)!

### Why?

Writing maintinable HTML & CSS is hard, especially with global CSS. Paperclip offers a generic way to write CSS that is scoped to the document that it's defined in, so you never have to worry about styles leaking again. 

### Features

- **No implicit & global CSS**. Instead, CSS selectors are scoped to the documents they'te defined in, and their exposure to _other_ documents is explicit.
- **Visual regression coverage**. Each Paperclip file is covered for visual regressions via Percy. [Learn more](https://paperclip.dev/docs/configure-percy/).
- **Incrementally adoptable**. You can incorporate Paperclip into your existing stack.
- **Can compile to multiple languages**. Paperclip files are designed to be compiled to multiple languages. [Learn more](https://paperclip.dev/docs/guide-compilers/).
- **Works with existing CSS**, and even third-party libraries. Paperclip can be used to scope any CSS that you have so that you know exactly where it's being used in your application. [Learn more](https://paperclip.dev/docs/guide-third-party-libraries/).
- **Strongly typed compile output**. PC files are compiled to strongly typed code (TypeScript for now).
- **Visual tooling**. Paperclip comes with UI tools that enable you to create UIs in _realtime_. 

![VS Code extension](assets/design-system.gif)

> VS Code extension that you can use for Paperclip. You can also use `npx paperclip dev` to launch visual tooling.

And more to come. Here's a glimpse:

- **A11y tooling** using [axe](https://www.deque.com/axe/).
- **CSS tree shaking** for CSS that you don't use in your application (especially third-party libraries).
- **More compile targets** including Flask, Laravel, etc.
- **Migration tooling** to help you move code over & away from Paperclip.
<!-- - **Figma sync** that enables you to synchronize  -->

### Resources

- [Slack channel](https://join.slack.com/t/paperclipglobal/shared_invite/zt-o6bbeo6d-2zdyFdR5je8PjCp6buF_Gg)
- Installation
  - [Project installation](https://paperclip.dev/docs/) - Basic installation of Paperclip for new and existing projects.
  - [VSCode Extension](https://paperclip.dev/docs/) - Getting started with the VS Code extension.
  - [Webpack setup](https://paperclip.dev/docs/configure-webpack) - Setting up with Webpack
- Documentation
  - [Syntax](https://paperclip.dev/docs/usage-syntax) - How to write Paperclip documents
  - [React usage](https://paperclip.dev/docs/usage-react) - Using Paperclip UIs in your React code



## Sponsors

![index](https://user-images.githubusercontent.com/757408/105444620-254d8d80-5ca9-11eb-97c8-9c0fd66408d4.png)


