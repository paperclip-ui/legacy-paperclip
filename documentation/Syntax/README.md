<!-- 

TODOS:

-->

Here's a kitchen sink example of most syntaxes:

```html

<!-- you can import components from other files -->
<import as="my-button" src="./button.pc">

<!-- all styles are scoped to this file -->
<style>
  div {
    color: red;
  }
</style>

<!-- components allow you to re-use groups of elements & text -->
<span component as="Message">Hello {children}!</span>

<!-- renders as "Hello World!" -->
<Message>
  World
</Message>

<!-- exports component for code usage -->
<span export component as="AnotherThing" {onClick}>
  <div {...someProps}>
    More children
  </div>
</span>
```

# Syntax

The syntax is basic HTML & CSS with a few additions. 

## Styling

You can style elements using the native `<style />` element. Note that styles are scoped to the template, meaning that they won't leak to _other_ templates. For example:

```html
<style>
  div {
    color: red;
  }
</style>

<div>Something</div>
```

The `div { }` rule here is only applied to `<div>Something</div>`. 

## Components

Components are useful for re-using groups of elements & text. Here's how you create one:

```html
<div component as="Message">
  Hello {text}
</div>

<!-- prints Hello World -->
<Message text="World" />
```

Components are defined by adding a `component` and `as` attribute to any element at the highest level in the template document. 

> Note that you can name components however you want, just bare in mind that the names will be in `PascalCase` when they're compiled to code. Because of that, I'd recommend using `PascalCase` for component names to make things more obvious.

## Exporting components

If you want to use components in JavaScript code, you'll need to define an `export` attribute. For example:

```html
<!-- counter.pc -->
<div export component as="Counter" {onClick}>
  Hello {currentCount}
</div>
```

Then in JSX code, you can import component:

```javascript
import {Counter as CounterView} from "./message.pc";
import React, {useState} from "react";

export function Counter() {
  const [currentCount, setCount] = useState(0);
  const onClick = () => setCount(currentCount + 1);

  return <CounterView 
    currentCount={currentCount} 
    onClick={onClick} 
  />;
};
```

## Default components 

Default exports can be defined using `default` for the `as` attribute:

```html
<!-- counter.pc -->
<div export component as="default" {onClick}>
  Hello {currentCount}
</div>
```

Here's how you import this component is JSX code:


```javascript
import Counter as CounterView from "./counter.pc";
import React, {useState} from "react";

export function Counter() {

  // code here...
  const currentCount = 0;
  const onClick = () => {};
  return <CounterView 
    currentCount={currentCount} 
    onClick={onClick} 
  />;
};
```

## {Bindings}

Bindings help you define dynamic parts of your components. 

#### slots

Slots are areas of your components where you'd like to insert text or elements. For example:

```html
<div component as="Message">
  Hello {text}
</div>

<Message text="World" />
<Message text={<strong>World</strong>} />
```

`{children}` behaves a bit differently:

```html
<div component as="Message">
  Hello {text}
</div>

<Message>
  <strong>World</strong>
</Message>
```

#### attribute bindings

Example:

```html

<style>
  .red {
    color: red;
  }
  .blue {
    color: blue;
  }
</style>

<div export component as="Message" class={class}>
  {children}
</div>

<Message class="red">
  Hello World
</Message>

<Message class="blue">
  Hello World
</Message>
```

Since the attribute key & binding share the same name, we can use the **shorthand approach**:

```html
<!-- styles here -->
<div export component as="Message" {class}>
  {children}
</div>

<Message class="red">
  Hello World
</Message>
```

#### spreads (...props)

You can spread properties to elements too. For example:

```html
<!-- some-input.pc -->
<input type="text" {...inputProps}>
```

This can be used in JSX code like so:

```jsx
import SomeInputView from "./some-input.pc";
export function SomeInput() {
  return <SomeInputView inputProps={{
    onKeyPress: event => {
      // do something
    },
    defaultValue: "somrthing"
  }}>
}
```


## `<import />`

> For a good example of this, check out the [React TodoMVC example](./../examples/react-todomvc).

`<import />` allows you to import other templates & CSS into your component files. 

#### Importing components

Suppose you have a `todo-item.pc` file:

```html
<li export component as="default">{label}</li>
```

You can import that file like so:

```html
<!-- todo-list.pc -->
<import as="todo-item" src="./todo-item.pc">

<ul component as="TodoItems">
  {todoItems}
</ul>

<!-- preview -->
<TodoItems
  todoItems={<fragment>
    <todo-item label="wash car" />
    <todo-item label="feed dog" />
  </fragment>}
/>
```

> For  `<fragment></fragment>` docs, check [here](#fragments-).

#### Rendering components from import

In some cases you may want to use different components from your imported file. For example:

```html
<style>
  li[data-completed] {
    text-decoration: line-through;
  }
</style>

<li export component as="default" data-completed={completed}>
  <input type="checkbox" onClick={onCompleteCheckboxClick}>
  {label}
</li>
<!--  
  Part that is used to preview component. no-compile tells
  compilers not to include this part.
-->

<default export component as="CompletedPreview" {label} completed />
<default export component as="IncompletePreview" {label} />
```

☝🏻`complete-preview`, and `incomplete-preview` give us different previews of our `todo-item` component. To use these parts in an import, we can do something like this:

```html
<!-- todo-list.pc -->

<import as="TodoItem" src="./todo-item.pc">

<div export component as="TodoList">

  <h1>Todos:</h1>
  <input type="text" onKeyPress={onNewTodoKeyPress}>

  <ul>
    {todoItems}
  </ul>
</div>

<TodoList todoItems={<fragment>
  <TodoItem:CompletedPreview label="Clean car" />
  <TodoItem:IncompletePreview label="Walk dog" />
</fragment>} />
```

Here's what the preview looks like:

<img width="508" alt="Screen Shot 2020-03-03 at 8 12 14 PM" src="https://user-images.githubusercontent.com/757408/75837752-6d12b000-5d8b-11ea-9948-949442731cf5.png">

The JSX code for that might look something like:

```javascript
// todo-list.jsx 

import React from "react";
import {TodoList as TodoListView} from "./todo-list.pc";

// We're using the TodoItem component assuming that it's using the todo-item.pc template.
import TodoItem from "./todo-item.tsx";

export function TodoList() {
  const todos = [
    { label: "Eat food" },
    { label: "Wash car" }
  ];

  return <TodoListView todoItems={
    todos.map(todo => <TodoItem item={item} />)
  } />
}
```

#### Importing CSS

CSS can also be imported. For example, here's a CSS file:

```css
/* global.css */
* {
  font-family: Helvetica;
}
```

You can import this file like so:

```html
<import src="./path/to/global.css">

<span>The font family of this text is Helvetica.</span>
```

#### Importing files from module directories

There may be cases where you want to import files from a common directory, like global styles. To define a module directory, you can update your `pcconfig.json` like so:

```javascript
{
  // ... more config
  "moduleDirectories": ["./src/styles"],
  // ... more config
}
```

Assuming that you have a file `src/styles/global.css`, you can import it like this:

```html
<import src="global.css">
```

### Fragments (`<fragment></fragment>`)

Fragments are useful if you're looking to render a collection of elements in a slot. For example:

```html
<ul component as="List">
  {listItems}
</ul>

<List
  listItems={<fragment>
    <li>feed fish</li>
    <li>feed cat</li>
    <li>feed me</li>
  </fragment>}
/>
```
