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
<span component as="message">Hello {children}!</span>

<!-- renders as "Hello World!" -->
<message>
  World
</message>
```

# Syntax

The syntax is basic HTML & CSS with a few additions. 

## Styling

`<style />`

## Creating components

You can define a component by adding a `component` & an `as` attribute. For example:

```html
<div component as="Message">
  Hello {message}
</div>
```

Note that components must always be defined at the highest level.

## Exporting components

You can export components by adding an `export` attribute (assuming there's also a `component` attribute). For example:

```html
<!-- message.pc -->
<div export component as="Counter" {onClick}>
  Hello {currentCount}
</div>
```

Then in JSX code, you can use your component like so:

```javascript
import {Message} from "./message.pc";
import React, {useState} from "react";

export function() {
  const [currentCount, setCount] = 
}
```

> ☝🏻This assumes that you're using a bundler.

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
<div export component as="message">
  Hello {children}
</part>

<message preview>
    World
</message>
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
  div[data-variant=red] {
    color: red;
  }
  div[data-variant=blue] {
    color: blue;
  }
</style>

<div data-variant={variant}> 
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


## What can go in slots?

Slots accept JSX, objects, references, booleans, arrays, and numbers. Here's a kitchen sink example:

```html
<div component as="some-part">
  Value: {value}
</div>

<some-part value="something" />
<some-part value={"something"} />
<some-part value={5} />

<some-part value={[
  <span></span>, 
  "some text", 
  5, 
  true, 
  false
]} />

<!-- Similar to using array, but you can omit commas with this syntax -->
<some-part value={<fragment>
    <span></span>
    5 true false
  </fragment>
} />

<!-- You can also use objects. -->
<span style={{background: "red"}}>Something</span>
```

## `component` attribute

The `component` attribute allows you to 

```html
<!-- todo-item.pc -->
<div export component as="LabelInput">
  <input type="text" onChange={onChange} />
</div>

<div export component as="TodoLabel">
  <div>
    <input type="checkbox" checked={completed}>
    <label onClick={onLabelClick}>{label}</label>
  </div>
</div>

<div export component as="default">
  <li>
    {children}
  </li>
</di>
```

Each part is exported using their `as` attribute. The `default` part, however is special in that it exports the part as the _default_ component. For example, here's how you might use the template above:

<!-- The `id` prop is what's used to export the part. The `default` id tells that the part should be exported as the _default_ component (similar to how the default import works in JavaScript). All other parts are exported using their  -->

<!-- In your app code, you might have something like: -->

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

#### `as="default"`

Assigning `<part as="default">...</part>` makes the part the _default_ export. For example:

```html
<!-- hello.pc -->
<part as="default">
  Hello {message}!
</part>
```

Which is just about the same as:

```html
Hello {message}!
```

The only difference here is how the template is used in a preview. For example:

```html
<part as="default">
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
<import as="hello" src="./hello.pc">

<!-- Render: Hello World! -->
<hello message="World" />
```
