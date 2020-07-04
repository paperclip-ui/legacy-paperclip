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

Paperclip is a language for building UI primitives. Here's an example:

```html

<!-- Styles are scoped to this document  -->
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

<!-- This component is compiled to code -->
<div export component as="Button" class:secondary class="button">
  {children}
</div>

<Button>
  This is a primary button
</Button>

<Button secondary>
  This is a secondary button
</Button>
```

☝🏻not much else to this. Here's how you use it in React:

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

> ☝🏻 Currently React is the only compiler target, but more are planned. 

## Why use Paperclip?


### Faster development

Paperclip comes with a [visual programming extension for VS Code](https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode-extension) that allows you to build UIs in realtime. 

![VSCode Demo](https://user-images.githubusercontent.com/757408/75412579-f0965200-58f0-11ea-8043-76a0b0ec1a08.gif)


### Visual regression testing

Paperclip encourages you to define previews of _every_ visual state of your UI. Because of that, you automatically get visual regression testing - no set up required. Just run `percy-paperclip` in your Paperclip project.


![Percy snapshots](./assets/snapshot.gif)


## Strongly typed 🦺

Paperclip templates compile to TypeScript definition files for safety. Here's an example:

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
