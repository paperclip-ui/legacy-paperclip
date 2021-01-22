![Checks](https://github.com/crcn/paperclip/workflows/Checks/badge.svg?branch=master)
<a href="https://github.com/crcn/paperclip/blob/master/MIT-LICENSE.txt"><img src="https://img.shields.io/github/license/crcn/paperclip" alt="License"></a>

<br />

# <img src="assets/logo.png" width="230">

Paperclip is a hybrid approach to building user interfaces that allows you to design & code in parallel.

**⚠️ Right now I'm polishing up this project, I'm looking for help on testing & feedback. [Please send me a message if you're interested!](https://forms.gle/FATDYcAVUdRVJvQaA)**

Paperclip is a DSL that focuses _purely_ on the visual aspect of your app - just HTML, CSS, and primitive components. Here's an example of what it looks like:

```html

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
    <TextInput placeholder="Username">

    </TextInput>
    <TextInput placeholder="Password">

    </TextInput>
    <FormFooter>
      <Button>Sign up</Button>
    </FormFooter>
  </AuthModal>}

  {showSignup && <AuthModal>
    <FormTitle>Sign up</FormTitle>
    <TextInput placeholder="Full Name">

    </TextInput>
    <TextInput placeholder="Username">

    </TextInput>
    <TextInput placeholder="Password">

    </TextInput>
    <TextInput placeholder="Repeat Password">

    </TextInput>
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


Here's the code above being created within Paperclip's designer:


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
    <auth.Modal>
      <auth.AuthModal> 
        <auth.FormTitle>Welcome back!</auth.FormTitle>
        <TextInput type="text" {...usernameInputProps} />
        <TextInput type="password" {...passwordInputProps} />
        <auth.FormFooter>
          <Button>Log in</Button>
        </auth.FormFooter>
      </auth.AuthModal>
    </auth.Modal>
  </form>;
};
```


#### What are some features of the DSL?

- No global CSS - everything's explicit so you never run into leaky styles.
- Sass-like syntax: nested selectors, mixins, etc.
- Generalized for multiple compile targets. Currently works with React, but other languages & frameworks are planned.
- No lock-in. Swap in and out any similar libraries (styled-components, emotion, etc)

### What else can you do with the designer?

- Measure between elements just like Figma
- Meta + select visual elements to reveal source code
- Create different sized frames for responsive testing
- Share your workspace with others & for cross-browser testing
- Browserstack integration - launch instance directly from designe
- Grid view of all of your project UIs so that you can visually find what you're looking for

### What does the IDE extension come equipt with?

- CSS fixings: auto-complete, color pickers, and more
- meta + click elements to reveal source code
- realtime updates between the designer & code.

### What are some other neat Paperclip features?

- Super easy visual regression coverage - just plug in Percy, point to Paperclip files, and you're good to go.

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

  // regular selectors can be used
  ol {
  }
</style>

<!-- Components exported to code -->

<ol export component as="List">

  <!-- you can also scope styles to elements like this -->
  <style>

    // element styles don't need selectors, you can just define them like so:
    padding-left: 1em;
    font-family: Open Sans;
  </style>
  {children}
</ol>

<li export component as="ListItem">
  <style>
    margin-top: 6px;
  </style>
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

<!-- ## Is this right for you?

The biggest questions you probably have about this library are:

- How's this approach better then what I'm used to?
- Is this project mature & validated?
- How often is this library being maintained?

#### How's this approach better then what I'm used to?

Mostly speed, safety, and maintainability. 

Speed-wise, y

- Is this project mature & validated? -->


# Roadmap

Here's a peek at what's planned for Paperclip:

- Multiple compiler targets so that you can re-use your Paperclip UIs in different languages & frameworks
- Extension for Atom, Sublime, and other editors
- Storybook integration
- More visual editing tools so that you don't have to write code. Possibly more designer-friendly tooling.
- A11Y & other linting stools
- Code splitting so that you don't need to include all of your CSS into one bundle
