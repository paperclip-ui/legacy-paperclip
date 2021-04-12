---
id: guide-how-to-use
title: Paperclip Basics
sidebar_label: The Basics
---

You can think of Paperclip as a language that focuses _purely_ on your web application's appearance -  just covering HTML, CSS, and basic components. With that, you can construct almost _all_ of your application UI in Paperclip. For example, here's a simple list:

```html live
<style>
  .list {
    padding-left: 1em;
    font-family: sans-serif;
  }
  .list-item {
    margin-top: 6px;
    &--completed {
      text-decoration: line-through;
    }
  }
</style>

<!-- Components -->

<ol export component as="List" className="list">
  {children}
</ol>

<li export component as="ListItem"
  className="list-item"
  className:completed="list-item--completed">
  {children}
</li>

<!-- Preview to see what the UI looks like in paperclip -->

<List>
  <ListItem>Bagels 🥯</ListItem>
  <ListItem completed>Yakitori 🍢</ListItem>
  <ListItem>Tofurky 🦃</ListItem>
  <ListItem>Skittles 🌈</ListItem>
</List>
```

Here's how you can use the template above in a React app:

```jsx
import * as React from "react";
import * as styles from "./GroceryList.pc";

export function GroceryList() {

  const groceries = [
    "Milk 🥛", 
    "Water 💧", 
    "Taco seasoning 🌮"
  ];

  return <styles.List>
    {
      groceries.map(item => (
        <styles.ListItem>{item}</styles.ListItem>
      ))
    }
  </styles.List>;  
}
```

☝🏻 Basically, all this component is doing is adding dynamic behavior to our Paperclip building blocks, and that's all there is to it between Paperclip UIs and code, really. UIs go in Paperclip, logic goes in code. 






