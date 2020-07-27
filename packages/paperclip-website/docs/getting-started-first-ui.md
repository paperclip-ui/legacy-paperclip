---
id: getting-started-first-ui
title: Creating your first UI
sidebar_label: Your first UI
---

Time to start using Paperclip! Create a new file in your source directory (defined in `paperclip.config.json`) that's called `GroceryList.pc`, then add this stuff:

```html
<!-- These styles are scoped to this document -->
<style>
  ol {
    padding-left: 1em;
    font-family: sans-serif;
  }
  li {
    margin-top: 6px;
  }
</style>

<!-- Components that can be imported into app code -->
<ol export component as="List">
  {children}
</ol>

<li export component as="ListItem">
  {children}
</li>

<!-- 
  Preview of UI for docs, development,
  and visual regression tests 
-->
<List>
  <ListItem>Bagels 🥯</ListItem>
  <ListItem>Yakitori 🍢</ListItem>
  <ListItem>Tofurky 🦃</ListItem>
  <ListItem>Skittles 🌈</ListItem>
</List>
```

> If you're using the VS Code extension, you'll be prompted to preview the UI. 

In the same directory, create a file called `GroceryList.tsx` with this content:

```tsx
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

> Generally, I like to name `*.pc` files & their associated `*.tsx` files the same because it's an easy convention, and it describes exactly what files go together. 

If you created a new project via `paperclip init`, then change your `entry.tsx` file to this:

```tsx
import * as React from "react";
import * as ui from "./hello-paperclip.pc";
import * as ReactDOM from "react-dom";
import { GroceryList } from "./GroceryList";

const mount = document.createElement("div");
document.body.appendChild(mount);


ReactDOM.render(<GroceryList />, mount);
```


Here's a full walkthrough:

![alt](/img/first-ui-demo.gif)