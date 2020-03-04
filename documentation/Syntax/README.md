<!-- 

TODOS:

-->

Here's a kitchen sink example of most syntaxes:

```html

<!-- you can import components from other files -->
<import id="my-button" src="./button.pc">

<!-- all styles are scoped to this file -->
<style>
  div {
    color: red;
  }
</style>

<!-- attribute binding -->
<div onMouseDown={onMouseDown}>
</div>

<!-- shorthand binding. Equivalent to onClick={onClick} -->
<div {onClick}>
  Here's a child
</div>

<!-- all of someProps properties are applied as attributes to this div -->
<div {...someProps}>
</div>

<!-- a bunch of nodes that you can re-use -->
<part id="message">
  <span>Hello {children}!</span>
</part>

<!-- renders as "Hello World!" -->
<message>
  World
</message>

<!-- Renders a preview of this component -->
<preview>
  <message>
    Some message
  </message>
  <message>
    Another message
  </message>
</preview>
```

# Syntax

## slots

Slots are areas of your template where you can add content. For example:

```html
<!-- hello.pc -->
Hello {message}!
```

If you're using React & Webpack, you can import this template like so:

```javascript
import HelloView from "./hello.pc";
export function Hello() {
  // return <HelloView message="World" />
  return <HelloView message={<strong>World</strong>} />;
}
```

#### children slot 

`{children}` is a special slot that takes children. Here's how it's used:

```html
<part id="message">
  Hello {children}
</part>

<preview>
  <message>
     World
  </message>
</preview>
```

☝🏻This renders `Hello World`. JSX code for this would look like:

```javascript
import {Message} from "./template.pc";
export function HelloWorldMessage() {
  return <Message>World</Message>;
}
```


## Attribute bindings

Example:

```html
<style>
  div[variant=red] {
    color: red;
  }
  div[variant=blue] {
    color: blue;
  }
</style>

<div variant={variant}> 
  Some text
</div>

<preview>
  <self variant="red" />
  <self variant="blue" />
</preview>
```

#### shorthand attributes

To make things easier, you can shorten how you bind to attributes. For example:

```html
<div {onClick}></div>
```

☝🏻 This is equivalent to:

```html
<div onClick={onClick}></div>
```

#### spreads (...props)

You can spread properties to elements too. For example:

```html
<!-- some-input.pc -->
<input type="text" {...inputProps}>
```

This can be used in JSX code like so:

```javascript
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


## `<part />`

Parts allow you to split your UI into chunks to use in app code. For example:

```html
<!-- todo-item.pc -->
<part id="LabelInput">
  <input type="text" onChange={onChange} />
</part>

<part id="TodoLabel">
  <div>
    <input type="checkbox" checked={completed}>
    <label onClick={onLabelClick}>{label}</label>
  </div>
</part>

<part id="default">
  <li>
    {children}
  </li>
</part>
```

In your app code, you might have something like:

```javascript
// todo-item.tsx
import TodoItem, {TodoLabel, LabelInput} from "./todo-item.pc";
import {useState} from "react";
export ({item, onChange}) => {
  const [editing, setEditing] = useState(false);
  const onBlur = () = setEditing(false);
  const onLabelClick = () => setEditing(true);

  return <TodoItem>
    {
      editing ? 
        <LabelInput onChange={onChange} onBlur={onBlur} /> : 
        <TodoLabel 
          onLabelClick={onLabelClick} 
          label={label} 
          completed={item.completed} 
        />
    }
  </TodoItem>
}
```

#### `no-compile` parameter

The `no-compile` parameter for `part` elements tells the compiler to omit it. This is useful for cases where you want to define `preview` part. [You can check out more about this below](#rendering-imported-parts).

#### `id="default"`

Assigning `<part id="default">...</part>` makes the part the _default_ export. For example:

```html
<!-- hello.pc -->
<part id="default">
  Hello {message}!
</part>
```

Which is just about the same as:

```html
Hello {message}!
```

The only difference here is how the template is used in a preview. For example:

```html
<part id="default">
  Hello {message}!
</part>

<preview>

  <!-- just call the default part -->
  <default />
</preview>
```

And:

```html
Hello {message}!

<preview>

  <!-- self refers to root nodes -->
  <self />
</preview>
```

Both options are used the same when imported:

```html
<!-- app.pc -->
<import id="hello" src="./hello.pc">

<!-- Render: Hello World! -->
<hello message="World" />
```


## `<preview />`

This is where you set up your components to see what they look like.

```html
<part id="label-input">
  <input {onKeyPress} {onBlur} default-value={label} type="text" class="edit" autofocus="autofocus">
</part>

<part id="todo-label">
  <div class="view">
    <input type="checkbox" class="toggle" onChange={onCheckChange} checked={completed}>
    <label onClick={onLabelClick}>{label}</label> 
    <button class="destroy"></button>
  </div> 
</part>

<part id="default">
  <li class="todo" {completed}>
    {children}
  </li>
</part>

<!-- variant previews -->
<part no-compile id="default-preview">
  <default {completed}>
    <todo-label {label} {completed} />
  </default>
</part>

<part no-compile id="editing-preview">
  <default {completed}>
    <label-input />
  </default>
</part>

<!-- main preview -->
<preview>
  <div class="app">
    <ul>
      <default-preview label="something" completed />
      <default-preview label="something else" />
      <default-preview label="to be continued" />
      <edting-preview />
    </ul>
  </div>
</preview>
```

### `<self />`

Renders the `root` children. 

```html
<part id="bolder">
  <strong>{children}</strong>
</part>

Hello {message}!

<preview>

  <!-- renders: Hello <strong>World!</strong>! -->
  <self message={<bolder>World</bolder>} /> 
</preview>
```

❗️Note that text & elements at the _root_ are combined into the same template. I find this approach to be preferable _if_ the template doesn't have any other `<part />` elements. If there _are_ multiple parts, I find it better to use a `default` part for the root nodes instead. For example:

```html
<part id="bolder">
  <strong>{children}</strong>
</part>

<part id="default">
  Hello {message}!
</part>

<preview>

  <!-- renders: Hello <strong>World!</strong>! -->
  <default message={<bolder>World</bolder>} /> 
</preview>
```

☝🏻 Defining a default part does just about the same thing as defining those nodes on the root. Then in your preview, just render `<default />` instead of `<self />`.

## `<import />`

> For a good example of this, check out the [React TodoMVC example](./../examples/react-todomvc).

`<import />` allows you to import other templates & CSS into your component files. 

#### Importing components

Suppose you have a `todo-item.pc` file:

```html
<li>{label}</li>
```

Or:

```html
<part id="default">
  <li>{label}</li>
</part>
```

You can import that file like so:

```html
<!-- todo-list.pc -->
<import id="todo-item" src="./todo-item.pc">

<part id="default">
  <ul>
    {todoItems}
  </ul>
</part>

<preview>
  <default
    todoItems={<>
      <todo-item label="wash car" />
      <todo-item label="feed dog" />
    </>}
  />
</preview>
```

> The <></> Syntax defines a [Fragment](#fragments-).

#### Rendering imported parts

In some cases, you may want to use different parts of your imported component. A good example of this is when you want to see different variants, for example:

```html
<style>
  li[completed] {
    text-decoration: line-through;
  }
</style>

<part id="default">
  <li {completed}>
    <input type="checkbox" onClick={onCompleteCheckboxClick}>
    {label}
  </li>
</part>

<!--  
  Part that is used to preview component. no-compile tells
  compilers not to include this part.
-->
<part no-compile id="completed-preview">
  <default completed {label} />
</part>

<part no-compile id="incomplete-preview">
  <default {label} />
</part>
```

☝🏻`complete-preview`, and `incomplete-preview` give us different previews of our `todo-item` component. To use these parts in an import, we can do something like this:

```html
<!-- todo-list.pc -->

<import id="todo-item" src="./todo-item.pc">

<!-- Alternatively, we can wrap this content in a part, but it's being rendered at the root for demonstration purposes -->
<h1>Todos:</h1>
<input type="text" onKeyPress={onNewTodoKeyPress}>

<ul>
  {todoItems}
</ul>

<preview>

  <!-- self refers to the text & elements at the root of this file -->
  <self
    todoItems={<>
      <todo-item:completed-preview label="Clean car" />
      <todo-item:incomplete-preview label="Walk dog" />
      <todo-item:completed-preview label="Clean car" />
    </>}
  />
</preview>
```
> Notice that `todo-item` corresponds with the import ID, and everything following after the colon (:) is the `part` name defined in `todo-item.pc`. In this case we're using `todo-item:completed-preview`, and `todo-item:incomplete-preview`.

> ❗️ Also note that we're defining todo items in the _preview_, and not exactly where they're being used. This is because we need an area where our `todo-list.jsx` can inject dynamic todo items (`{todoItems}`).

Here's what the preview looks like:

<img width="508" alt="Screen Shot 2020-03-03 at 8 12 14 PM" src="https://user-images.githubusercontent.com/757408/75837752-6d12b000-5d8b-11ea-9948-949442731cf5.png">

The JSX code for that might look something like:

```javascript
// todo-list.jsx 

import React from "react";
import TodoListView from "./todo-list.pc";

// We're using the TodoItem component assuming that it's using the todo-list.pc template.
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

### Fragments (`<></>`)

Fragments are useful if you're looking to render a collection of elements in a slot. For example:

```html
<part id="default">
  <ul>
    {listItems}
  </ul>
</part>

<preview>
  <default listItems={<>
    <li>feed fish</li>
    <li>feed cat</li>
    <li>feed me</li>
  </>} />
</preview>
```
