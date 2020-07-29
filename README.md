![Checks](https://github.com/crcn/paperclip/workflows/Checks/badge.svg?branch=master)
<a href="https://github.com/crcn/paperclip/blob/master/MIT-LICENSE.txt"><img src="https://img.shields.io/github/license/crcn/paperclip" alt="License"></a>



# <img src="assets/logo.svg" style="position: relative; top: 30px; height: 30px"> Paperclip 

Paperclip is a language for UI primitives. The goal of the library is centered around increasing the speed, safety, and accuracy of developing web interfaces. Here's how:

- **Realtime visual editing** - Paperclip's VS Code extension comes with a realtime preview that's powered by Rust, so you don't have to juggle back and forth between the browser & code anymore for writing basic HTML & CSS.
- **Automatic visual regression testing** - Just run the `percy-paperclip`, and you'll get visual snapshots of every UI state defined in Paperclip, so you can worry less about breaking CSS changes.
- **Scoped styling** - Styles are scoped to the documents that they're defined in, so you don't have to worry about them leaking out.
- **Compiles to strongly typed React code** - Paperclip compiles to plain TypeScript code that you can import directly into your React app (other frameworks will be supported soon).

### Other features

- **No runtime libraries** - Paperclip comes with a CLI tool and webpack loader that compiles Paperclip UIs into plain code.
- **SASS-like syntax** - Paperclip supports some sass-like features such as mixins, & nested rules. 
- **Rich VS Code experience** - Intellisense, color pickers, autocomplete, and more.
- **Zeplin integration** - (Experimental) sync design tokens to your project & use them in Paperclip UIs.

# Resources

- Installation
  - [Project installation](https://paperclip.dev/docs/) - Basic installation of Paperclip for new and existing projects.
  - [VSCode Extension](https://paperclip.dev/docs/getting-started-vscode) - Getting started with the VS Code extension.
  - [Webpack setup](https://paperclip.dev/docs/configuring-webpack) - Setting up with Webpack
- Documentation
  - [Syntax](https://paperclip.dev/docs/usage-syntax) - How to write Paperclip documents
  - [React](https://paperclip.dev/docs/usage-react) - Using Paperclip UIs in your React code
- Example projects
  - [Paperclip website](./packages/paperclip-website)
  - [Todo MVC](./examples/react-todomvc)


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

Here's a peak at what's planned for Paperclip:

- Multiple compiler targets so that you can re-use your Paperclip UIs in different languages & frameworks
- Extension for Atom, Sublime, and other editors
- Remote UI preview that you can use across devises & browsers (such as BrowserStack).
- Storybook integration
- UI editor controls:
  - CSS animation editor
  - various editors for colors, box shadows, filters, etc
- A11Y
- Code splitting so that you don't need to include all of your CSS into one bundle
