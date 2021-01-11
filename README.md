![Checks](https://github.com/crcn/paperclip/workflows/Checks/badge.svg?branch=master)
<a href="https://github.com/crcn/paperclip/blob/master/MIT-LICENSE.txt"><img src="https://img.shields.io/github/license/crcn/paperclip" alt="License"></a>

<br />

# <img src="assets/logo.png" width="230">

A template language designed for visual development.

![alt button demo](assets/button-demo.gif)


### Features

- **No global CSS** - Paperclip removes global CSS in favor of scoped styles.
- **Realtime visual editing** - Open up the paperclip dev server and see your UIs update in realtime _as you're writing code_.
- **Visual regression testing** - All Paperclip UI files are automatically covered for visual regression testing.
- **Browserstack integration** - launch any UI in Browserstack, directly from Paperclip.
- **No lock-in** - You can easily move away from Paperclip if you want to. I'd even wager that it's faster to build UIs in Paperclip _first_, then translate to something else. 
- **compiles to plain code** - Just import `*.pc` files into your app and use them like render functions.
- **No runtime libraries** - Paperclip comes with a CLI tool and webpack loader that compiles Paperclip UIs into plain code.
- **SASS-like syntax** - Paperclip supports some sass-like features such as mixins, & nested rules. 
- **Rich VS Code experience** - Intellisense, color pickers, autocomplete, and more.
- **Zeplin integration** - (Experimental) sync design tokens to your project & use them in Paperclip UIs.
- **Birds-eye view** - see of your UIs

<!-- Hidden until public beta -->
<!--# Resources

- Installation
  - [Project installation](https://paperclip.dev/docs/) - Basic installation of Paperclip for new and existing projects.
  - [VSCode Extension](https://paperclip.dev/docs/) - Getting started with the VS Code extension.
  - [Webpack setup](https://paperclip.dev/docs/configure-webpack) - Setting up with Webpack
- Documentation
  - [Syntax](https://paperclip.dev/docs/usage-syntax) - How to write Paperclip documents
  - [React](https://paperclip.dev/docs/usage-react) - Using Paperclip UIs in your React code
- Example projects
  - [Paperclip website](./packages/paperclip-website)
  - [Todo MVC](./examples/react-todomvc)
-->

# Example

Here's a basic Paperclip UI file:

```html
<!-- Scoped styles here -->
<style>
  ol {
    padding-left: 1em;
    font-family: Open Sans;
  }
  li {
    margin-top: 6px;
  }
</style>

<!-- Components exported to code -->

<ol export component as="List">
  {children}
</ol>

<li export component as="ListItem">
  {children}
</li>

<!-- Preview of UI -->

<List>
  <ListItem>Something</ListItem>
  <ListItem>Something</ListItem>
  <ListItem>Something</ListItem>
</List>
```

☝🏻 Here's how you can import this file in React code:

```jsx
import * as styles from "./styles.pc";

function GroceryList() {

  const groceries = [
    "Milk 🥛", 
    "Water 💧", 
    "Taco seasoning 🌮"
  ];

  return <styles.List>
    {
      groceries.map(item => (
        <styles.ListItem>{item}</styles.ListItem>;
      ))
    }
  </styles.List>;  
}
```

# Roadmap

Here's a peek at what's planned for Paperclip:

- Multiple compiler targets so that you can re-use your Paperclip UIs in different languages & frameworks
- Extension for Atom, Sublime, and other editors
- Storybook integration
- More visual editing tools so that you don't have to write code. Possibly more designer-friendly tooling.
- A11Y & other linting stools
- Code splitting so that you don't need to include all of your CSS into one bundle
