![Checks](https://github.com/paperclipui/paperclip/workflows/Checks/badge.svg?branch=master)

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

Currently Paperclip compiles to vanilla React code. Other compiler targets for languages such as PHP, Ruby, and Python, are currently in the works. If you'd like to contribute to this, feel free to reach out!

### Features

- **Basically HTML & CSS**. You can use your existing knowledge with Papaerclip since it's basically just HTML & CSS with a few additional features.
- **Explicit CSS**. Instead, CSS selectors are scoped to the documents they're defined in, and their exposure to _other_ documents is explicit via [@export](https://paperclip.dev/docs/usage-syntax#export). You can define global CSS, but that requires the [:global selector](https://paperclip.dev/docs/usage-syntax#global).
- **Works well with third-party CSS**. Paperclip can be used to keep third-party CSS contained so that you know exactly where it's being used in your application. [Learn more](https://paperclip.dev/docs/guide-third-party-libraries/).
- **Visual regression coverage**. Each Paperclip file is covered for visual regressions via Percy, so you can feel more confident about making big CSS changes. [Learn more](https://paperclip.dev/docs/configure-percy/).
- **Incrementally adoptable**. Paperclip can be used in your existing codebase, and you can slowly incorporate Paperclip to wrangle any messy CSS that you have. 
- **Can compile to multiple languages**. Paperclip is designed to be a generic approach to scope styles for any kind of web application. If you want, you can even build a compiler yourself using the helper libraries. [Learn more](https://paperclip.dev/docs/guide-compilers/).
- **Compiles to strongly typed code**. Paperclip exposes information about PC files that enables compilers to create strongly typed code. 
- **Visual tooling**. The UI tools allow you to build interfaces in _realtime_, and also comes with utilities such as zooming, measurement tools, and a style inspector to help you build UIs more quickly, and accurately.

![VS Code extension](assets/design-system.gif)

> The [VS Code extension](https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode) comes with syntax highlighting, code completion, and embeds the [visual tooling](https://paperclip.dev/docs/visual-tooling) that you can use to build UIs in realtime.

And more to come. Here's what's next:

- **A11y tooling** using [axe](https://www.deque.com/axe/).
- **CSS tree shaking** for CSS that you don't use in your application (especially third-party libraries).

### Resources

- [Slack channel](https://join.slack.com/t/paperclipglobal/shared_invite/zt-o6bbeo6d-2zdyFdR5je8PjCp6buF_Gg)
- Installation
  - [Project installation](https://paperclip.dev/docs/installation) - Basic installation of Paperclip for new and existing projects.
  - [VSCode extension](https://paperclip.dev/docs/guide-vscode) - Getting started with the VS Code extension.
  - [Webpack setup](https://paperclip.dev/docs/getting-started-webpack) - Setting up with Webpack
- API
  - [Syntax](https://paperclip.dev/docs/usage-syntax) - How to write Paperclip documents
  - [React usage](https://paperclip.dev/docs/usage-react) - Using Paperclip UIs in your React code
  - [Configuration](https://paperclip.dev/docs/configure-paperclip)
- [Visual tools](https://paperclip.dev/docs/visual-tooling)
- Guides
  - [Compilers](https://paperclip.dev/docs/guide-compilers/) - Basics in creating a compiler.



## Sponsors

![index](https://user-images.githubusercontent.com/757408/105444620-254d8d80-5ca9-11eb-97c8-9c0fd66408d4.png)


