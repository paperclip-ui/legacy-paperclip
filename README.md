<!-- most important stuff up top -->

<p align="center">
  <!--a href="https://circleci.com/gh/paperclip/vue/tree/dev">
    <img src="https://img.shields.io/circleci/project/github/paperclip/paperclip/dev.svg" alt="Build Status">
  </a-->
  <a href="https://www.npmjs.com/package/paperclip">
    <img src="https://img.shields.io/npm/l/paperclip.svg" alt="License">
  </a>
  <!-- TODO: change to chat.paperclip.dev -->
  <a href="https://discord.gg/H6wEVtd">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289da.svg" alt="Chat">
  </a>
</p>

⚠️ **This is a pre-release, so expect a few bugs and missing features!**

# Resources

- [Getting started](./documentation/Getting%20Started)
- [Download the VS Code extension](https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode-extension)
- [Syntax](./documentation/Syntax)
- [Contributing](./documentation/Contributing)

<!--

Notes:

- need to express that it's lightweight
-->

# Build UIs in real-time ⚡️

<!-- No more juggling between the coding & debugging in the browser. Paperclip provides tooling that allows  -->

Paperclip is a template language that's designed for visual development. See what you're creating in real-time, directly within VS Code.

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

<!-- A slim, ultra efficient way to stylize your web applications.  -->

<!--  that runs _while_ you write in it, and compiles down to application code in the framework of your choice. -->

![VSCode Demo](https://user-images.githubusercontent.com/757408/75412579-f0965200-58f0-11ea-8043-76a0b0ec1a08.gif)

## What is Paperclip exactly?

Paperclip just covers basic HTML, CSS, and syntax for defining _dumb_ components. Here's an example:

```html
<!-- todo-list.pc -->

<!--
Styles are scoped to this file, so you don't have to worry about them leaking out.
-->

<style>
  * {
    font-family: Helvetica;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  
  li[done] {
    text-decoration: line-through;
  }
</style>

<!-- Parts are building blocks that are individually used in application code (more information below). -->
<part id="TodoItem">

  <!-- You can assign attribute bindings. -->
  <li {done}>
    <input type="checkbox" checked={done} onClick={onDoneClick}>

    <!-- You can also define slots where text & elements are inserted into. -->
    {label}
  </li>
</part>

<part id="TodoList">
  <h1>Todos:</h1>
  <input type="text" onKeyPress={onNewTodoKeyPress} placeholder="Add a new todo..." >
  <ul>
    {todoItems}
  </ul>
</part>

<!-- Preview is a special tag for development that allows you to see how all of your parts look when put together in their varying states. -->
<preview>
  <TodoList todoItems={<>
    <TodoItem label="Feed cat" done />
    <TodoItem label="Take out trash" />
    <TodoItem label="Walk dog" done />
  </>} />
</preview>
```

Here's what you see in VS Code as you type away:

![Simple todo preview](https://user-images.githubusercontent.com/757408/75791302-ff866580-5d31-11ea-8da9-1c43631f0626.gif)



☝🏻This example uses just about all of the features that Paperclip has to offer. No logic, just syntax for describing how your UI looks. 

## How do I add logic? 

Templates compile directly to highly optimized code. Using our list example above, here's how you might use it in a React app:

```javascript

// <part /> elements are exposed as React components.
import { TodoList, TodoItem } from "./list.pc";
import React, { useState } from "react";

export default () => {
  const [todos, setTodos] = useState([
    { label: "Clean car" },
    { label: "Eat food", done: true },
    { label: "Sell car" }
  ]);

  const onNewInputKeyPress = (event) => {
    if (event.key === "Enter" && value) {
      setTodos([...todos, { label: event.target.value }]);
      event.target.value = "";
    }
  };

  const onDoneClick = (todo: Todo) => {
    setTodos(
      todos.map(oldTodo => {
        return oldTodo.id === todo.id
          ? {
              ...oldTodo,
              done: !oldTodo.done
            }
          : oldTodo;
      })
    );
  };

  // The attribute bindings & slots that were defined are
  // exposed as props for each <part /> component.
  return (
    <TodoList
      onNewTodoKeyPress={onNewInputKeyPress}
      todoItems={todos.map(todo => {
        return (
          <TodoItem
            done={todo.done}
            onDoneClick={() => onDoneClick(todo)}
            label={todo.label}
            key={todo.id}
          />
        );
      })}
    />
  );
};
```

> The code for this example is also [here](./examples/react-simple-todo-list).

> More compiler targets are planned for other languages and frameworks. React is just a starting point ✌🏻.

As you can see, `<part />` elements are exported as _dumb_ components that React can use. From there we can combine all parts with logic to create a functional component. That's the gist of Paperclip!

<!-- 
As you might have noticed, Paperclip just exports building blocks for your component. All of the logic remains in your application code, so you don't have to worry about  -->

## Strongly Typed 🦺

Templates compile down to strongly typed code, so you don't have to guess about what your templates need. Here's a generated TypesScript definition of our React app above:

```typescript
import {ReactNode, ReactHTML, Factory, InputHTMLAttributes, ClassAttributes} from "react";

type ElementProps = InputHTMLAttributes<HTMLInputElement> & ClassAttributes<HTMLInputElement>;

export declare const styled: (tag: keyof ReactHTML | Factory<ElementProps>, defaultProps?: ElementProps) => Factory<ElementProps>;

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

## Features ✨


- Works out of the box. Just download the [VS Code extension](https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode-extension) and start typing away. 
- Previews are powered by a low-level runtime, so your changes appear instantly, and won't slow down as your project scales.
- Templates can be compiled to strongly typed code.
- Templates Integrate with your existing React application (more languages & frameworks soon).
- Integrates with Webpack. 

## Roadmap 🌄

This is just the beginning! Here are just a few planned features:

- Zero-setup automated visual regression testing. Just plug in your Paperclip files.
- More compiler targets: Ruby, PHP, VueJS, AngularJS, and others.
- More code editor integrations: Sublime, Atom.
- More visual tooling in the preview, so you can make visual changes directly.
- Preview against different browsers directly within your code editor.
- Animation tooling 

## Goals 🎯

The goal for Paperclip is to eliminate bottlenecks around HTML & CSS development, and provide tooling that helps you ship UI features quicker. More specifically:

- Eliminate the lag time between writing code & seeing UI.
- Shorten the gap between design -> code by bringing more design tooling into web development.
- Provide better safety around building UIs with easier to use cross-browser testing tools. 

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
