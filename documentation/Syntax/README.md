<!-- 

TODOS:

-->

Here's a kitchen sink example of most syntaxes:

```html

<!-- you can import components from other files -->
<import as="my-button" src="./button.pc">
<import as="typography" src="design-system/typography.pc">

<!-- all styles are scoped to this file -->
<style>

  .button {
    text-decoration: underline;
  }

  div {
    color: red;
  }

  .message {

    /* We can define & include mixins from other files  */
    @include typography.default-text;
    color: red;
    &.alt {
      color: blue;
    }
  }
</style>

<!-- components allow you to re-use groups of elements & text -->
<span component as="Message" className="message {className?}" className:alt>Hello {children}!</span>

<!-- renders as "Hello World!" -->
<Message>
  World
</Message>

<!-- exports component for code usage -->
<span export component as="AnotherThing" {onClick}>
  <div {...someProps}>
    More children

    <!-- >>> allows us to pierce & reference styles -->
    <my-button className=">>>button">
      Some button
    </my-button>
  </div>
</span>
```

# Syntax

## Styling

You can style elements using the native `<style />` element. **Note that styles are scoped to the template, meaning that they won't leak to _other_ templates.** For example:

```html
<style>
  div {
    color: red;
  }
</style> 

<div>Something</div>
```

The `div { }` rule here is only applied to `<div>Something</div>`.

#### Global selectors

Global selectors allow you to apply styles _outside_ of the scope of this file. To do that, you can define:

```css
:global(.selector) {
  color: red;
}
```

**This property should be reserved for very special cases whre you need it.** For most other cases where you need to override styles, I'd recomend you use the style piercing operator (`>>>`).

#### Class reference (>>>)

Class references allow you to explicitly reference class names, and it's a way to define or reference styles in other files. Suppose for example I have a module `message.pc`:

```html
<style>
  .message {
    font-size: 24px;
    font-family: Helvetica;
  }
</style>
<div export component as="default" className="message {className?}">
  {message}
</div>
```

☝🏻This component allows for class names to be assigned to it. Here's how we do that:

```html
<import as="Message" src="./message.pc">
<style>
  .my-style-overide {
    text-decoration: underline;
  }
</style>
<Message className=">>>my-style-override">
  Hello World
</Messsage>
```

The `>>>my-style-override` is like an explicit reference to `.my-style-override` -- it tells Paperclip to attach special scope properties to `my-style-override` so that the message component receives the style.

We can also reference styles from imported documents. For that, check out the `@exports` section.

#### Variant class bindings

the `class:prop` functionality allows you to easily create variants of a component. For example:

```html
<style>
  .button {
    color: black;
    &.alt {
      color: red;
    }
    &.secondary {
      color: gold;
    }
  }
</style>
<div component as="Button" class="button" class:alt class:secondary>
  {children}
</div>

<Button>
  I'm the default button
</Button>
<Button alt>
  I'm an alt button
</Button>
<Button secondary>
  I'm the secondary button
</Button>
```

#### Mixins

Mixins allow us to define a group of CSS properties to use in style rules. For example:

```html
<style>
  @mixin default-font {
    font-family: Helvetica;
    color: #333;
  }

  @mixin big-text {
    font-size: 24px;
  }

  .header {
    @include big-text default-font;
  }
</style>
```

☝🏻 `.header` in this case is transformed into:

```css
.header {
  font-family: Helvetica;
  color: #333;
  font-size: 24px;
}
```

#### @export

The `@export` util allows us to export mixins, classes, and keyframes. For example, suppose I have a `typography.pc` file:

```html
<style>
  @export {
    @mixin default-font {
      font-family: Helvetica;
      color: #333;
    }

    @mixin big-text {
      font-size: 24px;
    }

    .header {
      @include big-text default-font;
    }
  }
</style>
```

I can use those exports like so:

```html
<import as="typography" src="design-system/typography.pc">

<style>
  .some-style {
    @include typography.big-text;
  }
</style>

<div className=">>>typography.header">
  Something
</div>
```


## Components

Components are useful for reusing groups of elements & text. Here's how you create one:

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
import CounterView from "./counter.pc";
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

Bindings help you define dynamic parts of your components. For example:

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

We can also include bindings in attribute strings. For example:

```html
<!-- styles here -->
<div export component as="Message" class="some-class {class}">
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

#### Optional bindings `{slot?}`

Paperclip supports optional properties like so:

```html
<div export component as="Test">
  {fullName?.first}
</div>
```

Which is translated into something like:

```typescript
type TestProps = {
  fullName?: {
    first: any
  }
};

export const Test = (props: TestProps) => {
  return <div>
    {props.fullName && props.fullName.first}
  </div>;
};
```

### `<import />`

> For a good example of this, check out the [React TodoMVC example](./../examples/react-todomvc).

`<import />` allows you to import other templates into your component files.  Suppose you have a `todo-item.pc` file:

```html
<li export component as="default">{label}</li>
```

You can import that file like so:

```html
<!-- todo-list.pc -->
<import as="TodoItem" src="./todo-item.pc">

<ul component as="TodoItems">
  {todoItems}
</ul>

<!-- preview -->
<TodoItems
  todoItems={<fragment>
    <TodoItem label="wash car" />
    <TodoItem label="feed dog" />
  </fragment>}
/>
```

> For  `<fragment></fragment>` docs, check [here](#fragments-).

#### Rendering components from import

In some cases you may want to use different components from your imported file. For example:

```html
<style>
  li.completed {
    text-decoration: line-through;
  }
</style>

<li export component as="default" class:completed>
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

☝🏻`CompletedPreview`, and `IncompletePreview` give us different previews of our `TodoItem` component. To use these parts in an import, we can do something like this:

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

The JSX usage code for that might look something like:

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


#### Importing files from module directories

There may be cases where you want to import files from a common directory, like global styles. To define a module directory, you can update your `pcconfig.json` like so:

```javascript
{
  // ... more config
  "moduleDirectories": ["./packages"],
  // ... more config
}
```

Assuming that you have a file `./packages/design-system/src/typography.pc`, you can import it like this:

```html
<import src="design-system/src/global.pc">
```
<!-- 
### Overriding component styles (>>>class-name)

You'll probably want to override component styles from time-to-time. Suppose that you have a `Message.pc` component:

```html
<style>
  .message {
    color: red;
  }
</style>
<div export component as="default" class="message {myClass}">
</div>
```

☝🏻Here, we're defining a `Message` component with a `class` that allows us to override the `Messsage` styles. Since styles are scoped, we'll need to use the special _deep_ operator `>>>` for that. Here's how you use it:

```html
<import as="Message" src="./message.pc">

<style>
  .message2 {
    color: blue;
  }
</style>

<Message myClass=">>>message2" />
```

The `>>>` operator allows you to deeply set class names that are defined within this component. Note that this can't be made dynamic. -->


### Fragments (`<fragment></fragment>`)

Fragments are useful if you want to render a collection of elements. For example:

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
