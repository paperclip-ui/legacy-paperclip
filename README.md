<!-- most important stuff up top -->

<p align="center">
  <!--a href="https://circleci.com/gh/paperclip/vue/tree/dev">
    <img src="https://img.shields.io/circleci/project/github/paperclip/paperclip/dev.svg" alt="Build Status">
  </a-->
  <a href="https://www.npmjs.com/package/paperclip">
    <img src="https://img.shields.io/npm/l/paperclip.svg" alt="License">
  </a>
  <!-- TODO: change to chat.paperclip.dev -->
  <!--a href="https://discord.gg/H6wEVtd">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289da.svg" alt="Chat">
  </a-->
</p>

# Resources


- [VS Code extension](https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode-extension)
- [Getting started](./documentation/Getting%20Started)
- [Syntax](./documentation/Syntax)
- Integrations
  - [React](./packages/paperclip-compiler-react)
  - [Webpack](./packages/paperclip-loader)
- Examples
  - [React TodoMVC](./examples/react-todomvc)

----

Paperclip is a language for building UI primitives. Here's a basic example:

```html
<style> 
  .button {
    font-family: Helvetica;
    display: inline-block;
    border-radius: 10px;
    padding: 10px 20px;
    color: #FFF;
    background: rgb(51, 51, 51);
    &.secondary {
      color: #333;
      border: 1px solid #333;
      background: transparent;
    }
  }
</style>

<!-- components to export -->
<div export component as="Button" class:secondary class="button">
  {children}
</div>

<!-- Previews -->

<Button>
  This is a primary button
</Button>

<Button secondary>
  This is a secondary button
</Button>
```

There's not much else to this. Here's how you'd use this component in React:

```typescript
import {Button} from "./button.pc";

export SomeForm = () => {
  return <>
    <Button>
      This is a primary button
    </Button>
    <Button secondary>
      This is a secondary button
    </Button>
  </>;
};
```

☝🏻 Currently React is the only compiler target, but more are planned. 

## Why?

Why use Paperclip? 

<!--

Notes:

- need to express that it's lightweight
- no compiler

-->

#### Realtime visual development

Paperclip comes with a visual programming extension for VS Code that allows you to build UIs in realtime. 

![VSCode Demo](https://user-images.githubusercontent.com/757408/75412579-f0965200-58f0-11ea-8043-76a0b0ec1a08.gif)


## Zero-config visual regression testing

Paperclip encourages you to define previews of _every_ visual state of your UI components. And because of that, you get visual regression testing for free -- just run `percy-paperclip`

Just run `percy-paperclip` on any Paperclip UI to test for visual regressions. 

<!-- Since previews are _part_ of building UIs in Paperclip, all you need to do to set up visual regression testing is run `percy-paperclip` against any Paperclip file. -->


![Percy snapshots](./assets/snapshot.gif)

<!-- TODO - And voila! Your UIs will appear in Percy. No additional setup necessary.  ->

## Features ✨

- Just covers presentational components.
- Real-time previews in VS Code (more code editors to come).
- Super fast, even for large codebases. 
- Templates compile to plain, strongly typed code.
- Works with Webpack.

<!-- 
As you might have noticed, Paperclip just exports building blocks for your component. All of the logic remains in your application code, so you don't have to worry about  -->

## Strongly typed 🦺

Templates compile down to strongly typed code. Here's an example:

```typescript
import {ReactNode, ReactHTML, Factory, InputHTMLAttributes, ClassAttributes} from "react";

type ElementProps = InputHTMLAttributes<HTMLInputElement> & ClassAttributes<HTMLInputElement>;

// class names that you can use outside of the template file
export declare const classNames: {};

type TodoItemProps = {
  done: String | boolean | Number | Object | ReactNode,
  onDoneClick: Function,
  label: String | boolean | Number | Object | ReactNode,
};

export const TodoItem: Factory<TodoItemProps>;

type TodoListProps = {
  onNewTodoKeyPress: Function,
  todoItems: String | boolean | Number | Object | ReactNode,
};

export const TodoList: Factory<TodoListProps>;
```

<!-- ### What makes Paperclip special?

Paperclip's syntax allows you to express _most_ of you user interface in a "dumb" way. -->


<!-- The current process around developing UIs is incredibly slow, especially as codebases scale. Paperclip was created -->


<!--UI development is a bit slow & inneficient, especially as projects scale, and code complexity kicks in. So I developed Paperclip to be a lightweight, and fast alternative for creating UIs that helps get the job done faster. 

The template language is limited -->

<!--

Points:

- lightwight
- bones of the UI

-->


<!--
## Roadmap 🌄

This is just the beginning! Here are just a few planned features:

- Minimal setup automated visual regression testing. Just plug in your Paperclip files.
- More compiler targets: Ruby, PHP, VueJS, AngularJS, and others.
- More code editor integrations: Sublime, Atom.
- More visual tooling in the preview, so you can make visual changes directly.
- Preview against different browsers directly within your code editor.
-->
