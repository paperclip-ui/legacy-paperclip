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

<!--

Notes:

- need to express that it's lightweight
- no compiler

-->

Paperclip is a template language for creating UIs in a flash. ⚡️

<!-- No more juggling between the coding & debugging in the browser. Paperclip provides tooling that allows  -->

<!-- Tooling is provided that brings a real-time preview of your application directly into your code editor. -->

<!-- Paperclip is a template language that runs while you're writing in it, so you can see a preview of exactly what you're creating in real-time. -->

<!-- No more wasted time juggling between the browser & code! -->


<!-- Paperclip code runs while you're writing it, so you never have to leave the IDE. UI files also compile down directly to React code. -->

<!-- Write your UIs and see a live preview of them directly within your IDE. Paperclip templates also compile to React code, so you can use them in your React app.  -->

<!-- Paperclip runs while you're writing it, so you never have to leave the IDE. UI files also compile down directly to React code.  -->

<!-- Paperclip code runs while you're writing it, so you can build features more quickly. UIs also compile down to application code, so you can use Paperclip in your existing codebase (currently React). -->


<!-- _See_ UIs that you're creating in real-time, directly within your code editor. Designed to integrate with your existing codebase (currently just React for now). -->

<!--
Templates are also designed to compile down to your application framework of choice (currently only React).
-->

<!-- 
_See_ UIs that you're creating in real-time, directly within your code editor. Paperclip comes with primitive UI behavior that allows you to setup the _bones_ UI 

-->

<!-- Paperclip comes with a runtime for VSCode that shows you a preview of UIs as  -->


<!--  that runs _while_ you write in it, and compiles down to application code in the framework of your choice. -->

![VSCode Demo](https://user-images.githubusercontent.com/757408/75412579-f0965200-58f0-11ea-8043-76a0b0ec1a08.gif)

> The VS Code extensions allows you to see a live preview of your components as you're building them


## Just primitive behavior

<!-- My biggest problem with UI development over the years has been the _speed_ of creating them. It's a time sink, especially as applications get bigger. And because user interface development is such as iterative process, waiting around for UIs to reload can be a real problem for productivity. -->

Paperclip comes with just primitive behavior for creating the look & feel of your application. These templates can then be used in your language of choice (currently just React). Here's an example template:

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

Here's how you'd use this component in React:

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

<!-- ## Perfect for your design system

[TODO GIF] -->

<!-- 
Paperclip provides a lightweight approach for creating presentational components. It's not intended to replace code, but instead allow you to focus on the just the basic construction of your user interfaces, without the heaviness that an _entire_ application brings. This allows Paperclip to be fast, and _remain_ fast as your project grows in size.  -->

<!-- #### Goals

- Quicker feedback loop between writing code & seeing UI, thus helping you code faster.
- Provide safety around building user interfaces, especially for large projects. This is helped with type safety, and visual regression tooling. 
- Have a platform & language agnostic approach for building user interfaces.  -->

<!-- #### Non-goals

- Turring-completeness. Paperclip will only provide features for expressing_ user interfaces that can be used in code. -->

## Zero-config visual regression testing

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
