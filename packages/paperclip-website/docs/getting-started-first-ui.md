---
id: getting-started-first-ui
title: Using Paperclip With React
sidebar_label: Using With React
---

Time to start using Paperclip! Create a new file in your source directory that's called `GroceryList.pc`, then add this stuff:

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

Paperclip files are just like any ordinary component file, so all we need to do is import PC components into
a React component. In the same directory, create a file called `GroceryList.tsx` with this content:

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

You'll notice that _all_ components that are exported from the Paperclip file are now accessible in our React component, and
the API is pretty similar to React's. For example, if we have a template like this:

```html
<div export component as="Button" {onClick}>
</div>
```

We can use the exported `Button` component like this:

```jsx
import { Button } from "./Button.pc";

<Button onClick={() => {
  /* do something */
}} />
```

Check out the [React API](/docs/usage-react) for more information on all the things you can do with Paperclip files.

Back to our demo. If you created a new project via `paperclip init`, then change your `entry.tsx` file to this:

```tsx
import * as React from "react";
import * as ui from "./hello-paperclip.pc";
import * as ReactDOM from "react-dom";

// import this 👇🏻
import { GroceryList } from "./GroceryList";

const mount = document.createElement("div");
document.body.appendChild(mount);

// change to this 👇🏻
ReactDOM.render(<GroceryList />, mount);
```


Here's a full walkthrough:

![alt](/img/first-ui-demo.gif)

And that's it! You've now fully integrated Paperclip into a React app. 