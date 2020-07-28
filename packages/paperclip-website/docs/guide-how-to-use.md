---
id: guide-how-to-use
title: Organizing Paperclip files
sidebar_label: How to use
---

You can think of Paperclip as a tool that focuses _purely_ on your web application's appearance -  just covering HTML, CSS, and basic components. With that, you can construct almost _all_ of your applications UI in Paperclip. For example, here's a simple list in Paperclip:

```html live
<style>
  .List {
    padding-left: 1em;
    font-family: sans-serif;
  }
  .ListItem {
    margin-top: 6px;
    &--completed {
      text-decoration: line-through;
    }
  }
</style>

<!-- Components -->

<ol export component as="List" className="List">
  {children}
</ol>

<li export component as="ListItem"
  className="ListItem"
  className:completed="ListItem--completed">
  {children}
</li>

<!-- Preview -->

<List>
  <ListItem>Bagels 🥯</ListItem>
  <ListItem completed>Yakitori 🍢</ListItem>
  <ListItem>Tofurky 🦃</ListItem>
  <ListItem>Skittles 🌈</ListItem>
</List>
```

The `<!-- Preview -->` section isn't actually production code -- it's used primarily for development, and visual regression testing purposes. It's a veeeery important part of Paperclip's design, so you'll be missing out a whole lot if you don't create previews. 

Here's how you can use the above template in a React app:

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

☝🏻 Basically, we're just using the exported components from the Paperclip file & creating a dynamic component out those building blocks.  

Here's a more sophisticated 👌. Here's are the basic UI building blocks for an address book app:

```html live
<style>
</style>

<div component as="Gutter" className="gutter">
  {children}
</div>

<div component as="Contact" className="contact">
  {children}
</div>

<div component as="App">
  {children}
</div>

<App>
  <Gutter>
  </Gutter>
  <Contact>
    <div>First name</div>
    <div>Last Name</div>
  </Contact>
</App>

```

