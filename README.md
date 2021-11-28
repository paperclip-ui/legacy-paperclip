![Checks](https://github.com/crcn/paperclip/workflows/Checks/badge.svg?branch=master)

<br />

<div style="text-align: left; margin-bottom: 32px;">
  <img src="assets/logo-outline-5.png" width="400">
</div>

<!-- ✨ **Wanna kick the tires around a bit? Check out the [Playground](http://playground.paperclip.dev)!** ✨ -->

Build UIs at the speed of thought. Paperclip is a template engine that comes with tools for building presentational components in realtime, all within your existing IDE:


![demo 2021-01-22 10_24_37](https://user-images.githubusercontent.com/757408/105437454-13b1b900-5c9c-11eb-8754-3769658180a1.gif)

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


## Example

Here's what Paperclip's syntax looks like (from GIF above):

```html

<!-- @frame is like a doc-comment & attaches metadata about your elements for the designer & other visual tooling. -->

<!--
  @frame { visible: false }
-->
<h4 export component as="FormTitle">
  
  <!-- Styles defined within elements are scoped, and don't need selectors -->  
  <style>
    margin: 0px;
  </style>
  {children}
</h4>

<!--
  @frame { visible: false }
-->

<!-- Note this would typically be defined in a separate file & imported into this doc -->
<input export component as="TextInput" {placeholder?} {type}>
  <style>
    border: 1px solid rgb(156, 156, 156);
    padding: 8px 16px;
    border-radius: 2px;
  </style>
</input>

<!--
  @frame { visible: false }
-->
<div export component as="FormFooter">  
  <style>
    display: flex;
    justify-content: flex-end;
  </style>
  {children}
</div>

<!--
  @frame { visible: false }
-->

<!-- This typically wouldn't be defined here -->
<button export component as="Button">
  <style>
    --button-bg-color: rgb(116, 176, 255);
    background: var(--button-bg-color);
    color: rgb(46, 85, 136);
    padding: 8px 16px;
    border-radius: 2px;
    border: 2px solid var(--button-bg-color);
  </style>
  {children}
</button>

<!--
  @frame { visible: false }
-->
<div export component as="AuthModal">
  <style>
    display: grid;
    grid-row-gap: 16px;
    max-width: 250px;
    margin: 0px auto;

    /* rule of thirds */
    top: 30%;
    padding: 32px;
    border-radius: 4px;
    color: rgb(97, 97, 97);
    background: rgb(238, 238, 238);
    position: relative;
    border: 1px solid rgb(194, 194, 194);
  </style>
  {children}
</div>

<!--
  @frame { visible: false, title: "Auth / login", width: 586, height: 446, x: 3, y: 141 }
-->
<div export component as="Preview">
  <style>
    font-family: sans-serif;
    height: 100vh;
  </style>
  
  {showLogin && <AuthModal>
    <FormTitle>Log in</FormTitle>
    <TextInput placeholder="Username" />
    <TextInput placeholder="Password" />
    <FormFooter>
      <Button>Sign up</Button>
    </FormFooter>
  </AuthModal>}

  {showSignup && <AuthModal>
    <FormTitle>Sign up</FormTitle>
    <TextInput placeholder="Full Name" />
    <TextInput placeholder="Username" />
    <TextInput placeholder="Password" />
    <TextInput placeholder="Repeat Password" />
    <FormFooter>
      <Button>Sign up</Button>
    </FormFooter>
  </AuthModal>}
</div>

<!--
  @frame { title: "Auth / Login", width: 501, height: 427, x: 0, y: 0 }
-->
<Preview showLogin />

<!--
  @frame { title: "Auth / Sign Up", width: 501, height: 561, x: 581, y: 1 }
-->
<Preview showSignup />
```

Here's how you integrate Paperclip into your code:

```typescript
import React from "react";
import * as styles from "./auth.pc";
import { TextInput } from "@design-system/components/TextInput";
import { Button } from "@design-system/components/Button";

export const LoginPage = () => {

  const { onSubmit, usernameInputProps, passwordInputProps } = useLogin();
  const userNameProps = useTextInput();

  return <form onSubmit={onSubmit}>
    <styles.Modal>
      <styles.AuthModal> 
        <styles.FormTitle>Welcome back!</styles.FormTitle>
        <TextInput type="text" {...usernameInputProps} />
        <TextInput type="password" {...passwordInputProps} />
        <styles.FormFooter>
          <Button>Log in</Button>
        </styles.FormFooter>
      </styles.AuthModal>
    </styles.Modal>
  </form>;
};
```

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


