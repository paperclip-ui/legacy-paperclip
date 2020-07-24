---
id: usage-syntax
title: Paperclip Syntax
sidebar_label: Syntax
---

### Writing HTML & CSS

You can start writing HTML and CSS as soon as you open up a Paperclip document. Here's an example:


```html live
<style>
  div {
    color: purple;
    font-size: 32px;
    font-family: papyrus;
  }
</style>
<div>I'm purple!</div>
```

**Styles are scoped**, meaning that they won't leak into other documents (you can still override styles using the class reference syntax), so you're welcome to define style selectors however you want. No special naming conventions needed.

## Styling

Styles in Paperclip have a bit more behavior than regular CSS.


### Nested rules

In Paperclip, you can nest style rules. For example:


```html live
// file: nested-style-demo.pc
<style>
  .container {
    .header {
      font-size: 32px;
      font-weight: 600;
      color: red;
    }
    .content {
      font-size: 18px;
      color: blue;
    }
  }
</style>

<div className="container">
  <div className="header">
    Header
  </div>
  <div className="content">
    content
  </div>
</div>
```

`&` can be used to combine the _parent_ selector in nested rules like so:

```html live
// file: nested-combine-demo.pc
<style>
  .button {
    font-family: Noteworthy;
    background: grey;
    display: inline-block;
    border: 2px solid grey;
    border-radius: 2px;
    padding: 2px 10px;
    &--secondary {
      color: grey;
      background: transparent;
    }
    &.preview {
      margin: 10px;
    }
  }
</style>

<div className="button preview">
  Button primary
</div>
<div className="button button--secondary preview">
  Button secondary
</div>
```

### Style mixins

Style mixins are useful for defining a bundle of style declarations (like `color`, `font-size`) that you then can include into style rules. For example:

```html live
// file: mixin-demo.pc
<style>
  :root {
    --font-family-default: Quotes Script;
    --color-grey-100: #333;
    --color-green-100: #0C0;
  }
  
  @mixin color-text-green {
    color: var(--color-green-100);
  }
  
  @mixin default-text {
    font-family: var(--font-family-default);
    color: var(--color-grey-100);
    font-size: 32px;
  }
  
  .message {

    /* @include includes style mixins; you can have any number of them separated by spaces. */
    @include default-text color-text-green;
    text-decoration: underline;
  }
</style>

<div className="message">
  What has to be broken before you can use it?
</div>
```

### Global styles

All style rules are, by default, scoped to the document they're defined in. This ensures that they don't leak & have unintended side-effects. However, there _are_ rare cases when you may need to define a global style rule, such as styling HTML defined outside of Paperclip that doesn't have a way to define a `class` attribute. 

Here's an example that stylizes parts of [react-select](https://github.com/JedWatson/react-select):

```html
<style>

  .wrapper {
    
    /* global for now so that we get tests to pass */
    :global(.select__) {
      &control {
        display: flex;
        background: var(--color-background);

        /* more declarations here */

        &--is-focused {
          /* more declarations here */
        }

        &:hover {
          /* more declarations here */
        }
      }
      &value-container,
      &single-value,
      &multi-value__label,
      &input {
        /* more declarations here */
      }

      /* selectors here */
    }
  }
</style>

<div export component as="Wrapper" className="wrapper">
  {children}
</div>
```

Here's how you use the above styles in React code:

```jsx
import * as ui from './Select.pc';

// Keep the select styles locked in
<ui.Wrapper>
  <DynamicSelect classNamePrefix="select" {...props} />
</ui.Wrapper>

```

<!-- TODO: styling external components guide -->

<!-- TODO: how to import existing CSS guide -->

## Defining components

Components are your UI building blocks. Here's an example:

```html live
<style>
  .Message {
    font-family: Comic Sans MS;
    font-size: 32px;
    color: #F0F;
  }
</style>

<!-- Components section -->

<!-- className and class can be used interchangeably -->
<div component as="Message" className="Message">
  {children}
</div>

<!-- Preview section -->

<Message>
  Hooray!
</Message>
```

You can define a component from _any_ root element (meaning that it's not a child of any element) by adding a `component` and `as="unique-component-name"` attribute.  Any other element that does _not_ have a `component` attribute is rendered to the screen. Think of those as previews. 

<!--Here's an example of how you can import the above component in React:

```jsx
import * as styles from "./message.pc";
<styles.Message>
  Hola!
</styles.Message>
```

Note that for components to be available in application code, they _must_ have the `component` attribute.-->

<!-- TODO: link to rendering previews -->

### Defining previews

Anything that doesn't have a `component` attribute is rendered to the screen, so you can utilize that behavior to see what you're working on.  For example:

```html live
// file: buttons.pc
<import src="./styles.pc" as="styles">

<!-- Components -->

<!-- >>> is a class reference -- docs below -->
<div component as="Button" 
  className=">>>styles.Button"
  className:secondary=">>>styles.Button--secondary"
  className:negate=">>>styles.Button--negate">
  {children}
</div>

<!-- Previews -->

<Button>primary</Button>
<Button secondary>secondary</Button>
<Button negate>negate</Button>
<Button negate secondary>negate secondary</Button>

// file: styles.pc

<style>
  :root {
    --color-grey-primary: #999;
    --color-red-primary: #990000;
  }
  
  .Button {
    font-family: Bradley Hand;
    padding: 4px 10px;
    background: var(--color-grey-primary);
    color: white;
    display: inline-block;
    margin-left: 10px;
    border-radius: 4px;
    box-sizing: border-box;
    border: 2px solid var(--color-grey-primary);
    &--secondary {
      background: transparent;
      color: var(--color-grey-primary);
    }
    &--negate {
      background: var(--color-red-primary);
      border-color: var(--color-red-primary);
    }
    &--negate&--secondary {
      background: transparent;
      color: var(--color-red-primary);
    }
  }
</style>
Nothing to see here!
```

> Check out the [React Todo MVC Example](https://github.com/crcn/paperclip/blob/master/examples/react-todomvc/src/app.pc) if you're looking for a more extensive demo. 

I'd recommend that you render every visual state of your UI in Paperclip since since that will enable you to set up more reliable [visual regression tests](safety-visual-regression.md).

Also note that preview elements won't affect your application size since they're not compiled, so you can write previews to your hearts content. 

<!-- TODO - point to class name variants -->
<!-- TODO - point to guide around defining previews -->

### Exporting components

To export a component, simply add an `export` attribute like so:

```html live
// file: todos.pc
<import src="./styles.pc" as="styles">

<!-- Components -->

<div export component as="App" className=">>>styles.App">
  {children}
</div>

<input export component as="NewItemInput" {onChange} />

<div export component as="Header" className=">>>styles.Header">
  <h4>Todos</h4>
  {children}
</div>

<ul export component as="List" className=">>>styles.List">
  {children}
</ul>

<li export component as="Item" className=">>>styles.Item" {onClick}>
  <input type="checkbox" checked={completed}> 
  <span className=">>>styles.label">{children}</span>
</li>

<!-- Preview -->

<App>
  <Header>
    <NewItemInput />
  </Header>
  <List>
    <Item>Wash car</Item>
    <Item>Wash car</Item>
    <Item completed>Wash car</Item>
  </List>
</App>

// file: styles.pc

<!-- Typically in the same file as components, but they're here for this demo since they're not the focus. -->
<style>
  .App {
    font-family: Chalkduster;
  }
  .Header {  
    h4 {
      margin: 0;
      margin-bottom: 8px;
    }
    margin-bottom: 8px;
  }
  .List {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }
  .Item {

    // Needs
    :global(input[type="checkbox"]) {
      margin-right: 8px;
      &:checked ~ .label {
        text-decoration: line-through;
      }
    }
  }
</style>

No preview here!
```

Here's how we can use this in our React app:

```jsx
import React, { useRef, useState } from "react";
import * as ui from "./todos.pc"

const TodoApp = () => {
  const [todos, setTodos] = useState([
    { completed: true, label: "walk dog" },
    { completed: true, label: "take out trash" }
  ]);

  const onNewInputChange = (event) => {
    // code to add new todo item here
  }

  return <ui.App>
    <ui.Header>
      <NewItemInput onChange={} />
      <ui.List>
        {todos.map(({completed, label}, i) => (
          <ui.Item 
            onClick={/* toggle completed handler here */} 
            completed={completed}>
            {label}
          <ui.Item>
        ))}
      </ui.List>
    </ui.Header>
  </ui.App>;
}
```

## Overriding component styles

You can override component styles using the `>>>` syntax like so:

```html live
// file: style-override-demo.pc
<import as="Message" src="./message.pc">
<style>
  .my-style-override {
    text-decoration: underline;
  }
</style>
<Message className=">>>my-style-override">
  Hello World
</Message>

// file: message.pc

<style>
  .message {
    font-size: 24px;
    font-family: Helvetica;
  }
</style>
<div export component as="default" className="message {className?}">
  {children}
</div>
```

The `>>>` syntax can also be used to reference styles from other documents:

```html live
// file: entry.pc
<import src="./typography.pc" as="typography">
<span className=">>>typography.default-font">
  Hola amigo!
</span>

// file: typography.pc
<style>
  @export {
    .default-font {
      font-family: papyrus;
      letter-spacing: 0.05em;
      font-size: 32px;
      color: green;
    }
  }
</style>
```

<!--Bare in mind that components that take a class attribute must _always_ contain `>>>` prefix. For example:

```html live
<style>
  .SomeText {
    font-family: SignPainter;
    font-size: 32px;
  }
  .purple-text {
    color: purple;
  }
</style>

<div component as="SomeText" className="SomeText {customClassName?}">
  {children}
</div>

<SomeText customClassName=">>>purple-text">
  This is purple text
</SomeText>

<SomeText customClassName="purple-text">
  This is <strong>not</strong> purple text
</SomeText>
```

☝🏻 This reason for this is that Paperclip doesn't know that `customClassName` _is_ a className, so you need to provide a `>>>` to help with that. -->


<!--## Components of components

There may be a case where you want to define a component of a component. Just add the `component` + `as="component-name"` combo on an instance like so:

```html live
<style>
  .Input {
    border-radius: 2px;
    border: 1px solid orange;
    display: block;
    &::placeholder {
      color: orange;
    }
  }
  .CustomInput {
    border: 1px solid red;
  }
  .preview {
    margin: 10px;
  }
</style>

<input component as="MyInput" 
  className="Input {customClassName?}" 
  {placeholder?}
  {value?} 
  {defaultValue?}>

<MyInput component as="CustomInput"
  customClassName=">>>CustomInput {customClassName?}" 
  {placeholder?}
/>

<MyInput customClassName=">>>preview" placeholder="default input" />
<CustomInput customClassName=">>>preview" placeholder="custom input" />
```

☝🏻 This particular pattern is useful if you need to override styles & also want to keep the overrides in one spot.  -->

## Importing documents

Documents can export styles & components, which can then be imported into other Paperclip docs. For example:

```html live
// file: main.pc
<import src="./pane.pc" as="pane">

<pane.Container>
  <pane.Header>
    Header content
  </pane.Header>
  <pane.Content>
    Some content
  </pane.Content>
</pane.Container>


// file: pane.pc
<style>
  .Container {

  }
  .Header, .Content {
    margin: 0px 8px;
  }
  .Header {
    font-size: 18px;
    font-weight: 600;
  }
  .Content {
  }
</style>

<div export component as="Container" className="Container">
  {children}
</div>

<div export component as="Header" className="Header">
  {children}
</div>

<div export component as="Content" className="Content">
  {children}
</div>

<!-- Preview -->

Nothing here!
```

The import element takes a `src` and an _optional_ `as="unique-namespace"` attribute. The `as` keyword is your access point into anything exported by the imported document, like above. 

### Importing styles

You're also welcome to reference exported styles from other documents, too - particularly `class names`, `mixins`, and `keyframes`. For example:

```html live
// file: main.pc
<import src="./styles.pc" as="styles">

<style>
  .header-text {
    @include styles.big-text;
    animation: styles.pulse 1s infinite;
  }
</style>

<!-- >>> is a class reference - docs below -->
<div className="header-text >>>styles.default-text">
  Does "heterological" describe itself?
</div>

// file: styles.pc

<style>

  /* Exported mixins */

  /* @export docs below */
  @export {
    @mixin text-color-green-default {
      color: green;
    }
    @mixin big-text {
      font-size: 32px;
    }
  }

  /* Exported classes */

  @export {
    .default-text {
      font-family: Herculanum;
      letter-spacing: 0.05em;
    }
  }

  /* Exported animations */

  @export {
    @keyframes pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
      100% {
        opacity: 1;
      }
    }
  }
</style>
```

Note that you _must_ wrap styles around `@export` if you want to reference them. 

> I'd recommend only exporting things that you need in other documents since export keywords (`@export`, `export`) make it clear around what's public & private. 

### Global imports

`:root` and `:global` CSS properties are applied globally when imported. Here's an example:

```html live
// file: demo.pc
<import src="./styles.pc">
<style>
  .message {
    color: var(--color-red-default);
  }
</style>
<div className="message">
  A male barber shaves all and only those men who do not shave themselves. Does he shave himself?
</div>
// file: styles.pc
<style>
  :root {
    --color-red-default: #900;
  }

  /* Try to avoid doing this 🙅‍♂️. Use mixins or class references instead. */
  :global(body) {
    font-family: Kai;
    font-size: 18px;
  }
</style>
```

It's okay to define `:root` variables - this is common pattern around defining themes. Try to avoid `:global` selectors whenever possible however since they leak into other documents, and may result in unintended side-effects. More on this below.

<!-- TODO BELOW: why you should avoid :global -->

<!-- TODO: guide overriding UIs -->

## Bindings

You may have noticed the use of `{children}` above - this is a binding, and Paperclip has a number of ways to define them.

### Child bindings

The `{children}` binding works like so:

```html live
<h1 component as="Header">
  {children}
</h1>

<Header>
  I'm not a header
</Header>
```

`{children}` is _reserved_, meaning that it can only be used specifically for child elements. 

There will probably be the case where you want to define multiple areas of a component for children to go into. Here's an example of that:

```html live
// file: main.pc
<import src="./styles.pc" as="styles">

<!-- Components -->

<div component as="Pane" className=">>>styles.Pane">
  <div className=">>>styles.header">
    <div className=">>>styles.title">{title}</div>
    <div className=">>>styles.controls">{controls}</div>
  </div>
  <div className=">>>styles.content">
    {children}
  </div>
</div>

<div component as="AddButton">
  +
</div>

<!-- Previews -->

<Pane title={<strong>My header</strong>} controls={<AddButton />}>
  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
</Pane>

// file: styles.pc

<!-- keeping this in another file so that it's not the center of attention -->
<style>
  @export {
    .Pane {
      font-family: Courier;
      width: 200px;
      color: #333;
      .header, .content {
        padding: 4px 8px;
      }
      .header {
        background: #C0C0C0;
        display: flex;
        .title {
          flex-grow: 1;
        }
      }
      .content {
        background: #CFCFCFCF;
        padding: 4px;
      }
    }
  }
</style>
```

`{title}` and `{controls}` (and technically also `{children}`) are considered _slots_ for children to go into, and they can be filled in via attributes:

```html
<Pane 
  title={<span>some title</span>} 
  controls={<button>A button</button>}>
  Content children
</Pane>
```

### Attribute bindings

Attributes basically allow you to define dynamic data on a component. For example:

```html live
// file: buttons.pc
<import src="./typography.pc" as="typography">
<import src="./styles.pc" as="styles">

<!-- Components -->

<!-- Generally I'd recommend just a `{className}` binding instead of `{customClassName}` class name, which I'm only using here to make more clear around how it works. -->
<div component as="Button" 
  className=">>>styles.button {customClassName}">
  {children}
</div>

<!-- Previews -->

<Button customClassName=">>>typography.big-text >>>typography.strong">
  Button
</Button>

// file: styles.pc
<import src="./typography.pc" as="typography">
<style>
  @export {
    .button {
      color: red;
      @include typography.default-text;
    }
  }
</style>

Nothing to see!

// file: typography.pc
<style>
  @export {
    @mixin default-font {
      font-family: Helvetica;
    }
    @mixin default-text {
      @include default-font;
      font-size: 18px;
      color: #333;
    }
    .big-text {
      @include default-font;
      font-size: 32px;
      font-weight: 
    }
    .strong {
      font-weight: 800;
    }
  }
</style>

Nothing to see!
```

Here's how you could use do a similar thing in React:

```jsx
import cx from "classnames";
import * as ui from "./buttons.pc"
import * as typography from "./typography.pc"

<ui.Button className={cx(
  typography.classNames["big-text"],
  typography.classNames["strong"]
)} />
```

Bindings can also be defined outside of string attributes. For example:

```html
<div component as="Test">
  <span className="title" ref={spanRef}>
    {title}
  </span>
  {children}
</div>
```

> Ref here is specific to React around referencing DOM nodes. 

You can also use the shorthand approach like so:

```html
<div component as="Test">
  <span className="title" {spanRef}>
    {title}
  </span>
  {children}
</div>
```

This is particularly useful for removing some redundancy in your code. For example:

```html
<input export component as="Input" 
  {onChange?} 
  {defaultValue}
  {value}
/>
```


### Optional bindings

By default, bindings are required. So if you define `{className}` on an element, that property will be required when compiled into application code. To make a binding optional, just add a `?` after the binding name like so:

```html
<div component as="Message" {className?}>
  {children}
</div>
```

☝🏻 Here, `className` is optional, whereas `children` is not. When compiled to TypeScript, here's what you get:

```typescript
/* other generated code here */

type MessageProps = {
  className?: Function,
  children: ReactNode,
};

export const Message: React.FC<MessageProps>;
```

So in other words, your application won't compile if you're providing the incorrect Paperclip UI props.

<!-- TODO: docs on type safety -->

### Variant bindings

Variant bindings were touched on a bit under the [Defining reviews](#defining-previews) section. Basically, you can apply different class names depending on your component properties. Here's an example:

```html live
<style>
  .Header {
    font-family: Luminari;
    font-size: 12px;
    &--big {
      font-size: 32px;
    }
    &--medium {
      font-size: 18px;
    }
    &--small {
      font-size: 12px;
    }
  }
</style>

<div component as="Header"
  className="Header">
  TODO
</div>

<Header />
```