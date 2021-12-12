![Checks](https://github.com/crcn/paperclip/workflows/Checks/badge.svg?branch=master)

<br />

<div style="text-align: left; margin-bottom: 32px;">
  <img src="assets/logo-outline-5.png" width="400">
</div>

<!-- ✨ **Wanna kick the tires around a bit? Check out the [Playground](http://playground.paperclip.dev)!** ✨ -->

Paperclip is a tiny language that enables you to create presentational components for any framework. Here's what it looks like:

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

Paperclip modules can be imported directly into your regular code like so:

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { Message } from "./my-module.pc";

ReactDOM.render(<Message>
  Hello Paperclip!
</Message>, document.body);
```

### Why?

Paperclip was created to be a generic approach to building durable HTML & CSS. That means:

- **No global CSS**. With Paperclip, CSS is scoped to the document it's defined in, so you don't have to worry about styles leaking out.
- **Confidently make HTML & CSS changes**. Paperclip comes with visual regression tooling that allows you to easily track _all_ visual changes in Paperclip files, so you can feel comfortable making big change without breaking production. 
- **Long shelf life for UIs**.




Build UIs at the speed of thought. Paperclip is a template engine that comes with tools for building presentational components in realtime, all within your existing IDE:


<!-- ![demo 2021-01-22 10_24_37](https://user-images.githubusercontent.com/757408/105437454-13b1b900-5c9c-11eb-8754-3769658180a1.gif) -->

> This took me about 12 minutes to make start to finish.

## Features

- Templates compile down to plain React code (more targets planned).
- Scoped CSS. Write styles however you want, without worying about them leaking out.
- [Percy](https://percy.io) integration for catching visual regressions.
- Compatible with existing CSS libraries like Tailwind, Bulma, and Bootstrap.

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


## Roadmap

What's the future looking like for Paperclip? Here's the tentative plan:

1. ✅ Prettier integration
2. ✅ Avocode / Figma integration (Figma to design sync)
3. 🔲 CSS & HTML linting (a11y, showing unused styles, caniuse integration)
4. 🔲 CSS tree shaking (removing unused CSS from builds)
5. 🔲 Visual builder (no-code like)
6. 🔲 Multiple compiler targets: PHP, Ruby, VueJS, Svelte
7. 🔲 IDE integrations

## Sponsors

![index](https://user-images.githubusercontent.com/757408/105444620-254d8d80-5ca9-11eb-97c8-9c0fd66408d4.png)


