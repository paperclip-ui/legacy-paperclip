---
id: guide-thinking-in-paperclip
title: Thinking In Paperclip
sidebar_label: Thinking In Paperclip
---

Think of Paperclip as your UI layer that contains _all_ of your HTML & CSS. These files contain no logic, just the appearance. Your React components' role is to add interactivity to these files.

Let's start off with a simple list UI in Paperclip:

```html live
<style>
  ul {

  }
  li {

  }
</style>

<!-- Components -->

<div export component as="Header">
  <input placeholder="Add an item" ref={newInputRef}>
  <input type="submit" value="Add Item" onClick={onAddItemButtonClick}>
</div>

<ol export component as="List">
  {children}
</ol>

<li export component as="Item">
  {children}
</li>

<!-- Preview -->

<Header />
<List>
  <Item>item 1</Item>
  <Item>item 2</Item>
  <Item>item 3</Item>
</List>
```

This list contains _all_ of the HTML & CSS for our user interface, and exposes the building blocks - components, that can be used in React code to make the list interactive. Here's the code for our list:

```jsx
import React, {useState, useRef} from "react";
import * as styles from "./styles.pc";
export const List = () => {
  const newInputRef = useRef();

  const [listItems, setListItems] = useState([
    "item 1",
    "item 2",
    "item 3"
  ]);

  const onAddItemButtonClick = () => {
    setListItems([...listItems, newInputRef.current.value]);
    newInputRef.current.value = "";
  }

  return <>
    <styles.Header  
      newInputRef={newInputRef}
      onAddItemButtonClick={onAddItemButtonClick} />
    <styles.List>
      {listItems.map(item => (
        <styles.Item>{item}</styles.Item>
      ))}
    </styles.List>
  </>
};
```

That's all there is to it between Paperclip UIs and React code. UIs go into Paperclip, logic & behavior goes into code. That's it. 


We'll start off with the relationship between Paperclip & code. Think of it this way: HTML & CSS goes into Paperclip, logic goes into your React code. Here's an example:

```html
<style>
  .button {

  }
</style>

<>
```

When you first open up a Paperclip document, just start writing your app's HTML & CSS. Don't worry about components or how the HTML is used in React code, we can handle that later. 

Let's start with a simple website:

```html live
<style>
  
</style>

<!-- Website code -->

```

I find it so much easier & faster to write just HTML & CSS first - no components or variables, just plain-old HTML & CSS. Better yet if we use a design file from Sketch or Figma, we can re-use some of the structure. We can iterate over the HTML & CSS until the structure is just right, and then move onto creating the building blocks that are needed in React code. 

After writing basic HTML & CSS, we can _see_ what needs to be modularized, so let's do that with our website above:


Paperclip UIs are basically HTML & CSS with the ability to define components. When you're first starting any document, I'd actually recommend
just writing vanilla HTML & CSS off the bat, and later on add components.  Here's an example:

```html live

<!-- Styles are the same as HTML & CSS -->
<style>
  .pane {
    /* Nested rules are OK 👍🏻 */
    .header { 
      padding: 8px;
    }

    .content {
      padding: 8px;
    }
  }
</style>


<!-- Components - these are not  -->
<div export component as="Pane">
  <div className="header">
    {content}
  </div>
  <div className="content">
    {content}
  </div>
</div>

<!-- preview of the component -->
<Pane>