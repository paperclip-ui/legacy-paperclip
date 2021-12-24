---
id: usage-react
title: Using Paperclip In React Apps
sidebar_label: React
---


After building your Paperclip files, you can import them just as regular JavaScript modules. For example:

```tsx

// I like to keep all of the styles in a single namespace
// to communicate that `ui.ComponentName` is a primitive comming from
// a Paperclip file. 
import * as styles from "./counter.pc";

// Another option
// import * as styles from "./counter.pc";

import React, { useState } from "react";

export default () => {
  const [currentCount, setCount] = useState(0);
  const onClick = () => setCount(currentCount + 1);
  return <styles.Container onClick={onClick}>
    <styles.CurentCount>{currentCount}</styles.CurrentCount>
  </styles.Container>;
};
```


☝🏻 This example uses the following Paperclip UI file:

```html live
<style>
   .container {
     font-family: Helvetica;
     cursor: pointer;
   }
   .current-count {
     font-weight: 400;
   }
</style>

<!-- Components -->

<div export component as="Container" class="container">
  Current count: {children}
</div>
<div export component as="CurrentCount" class="current-count">
  {children}
</div>

<!-- Previews -->

<Container>
  <CurrentCount>
    50
  </CurrentCount>
</Container>
```

## classNames

You can import class names that are exported from PC files (using `@export`). 

**Syntax**

```javascript
import * as styles from "./counter.pc";
<div className={styles.classNames["classname-defined-in-paperclip"]} />
```

here'x how you expose classes for JavaScript usage:

**Example**

```html
<style>
  @export {
    .my-style {
      color: red;
    }
  }
</style>
```

## Adding props

Props can be defined just like any ordinary React component. Take this template for example:

```html
<div export component as="Button" {onClick?}>
  {children}
</div>
```

In React code, we can define our `onClick` handler like so:

```jsx
import * as styles from "./button.pc";

<styles.Button onClick={handleClick} />
```

## Theming

You can easily theme React components by exposing `styles` as a prop on your component. For example:

```tsx
import * as defaultStyles from "./GroceryList.pc";

export type GroceryListProps = {
  styles?: Partial<typeof defaultStyles>,
  items: string[]
};

export function GroceryList({ items, styles: styleOverrides = {} }: GroceryListProps) {
  const styles = {...defaultStyles, ...styleOverrides};
  
  return (
    <styles.List>
      {items.map(item => (
        <styles.ListItem>{item}</styles.ListItem>
      ))}
    </styles.List>
  );
}
```

Then, to override these styles, just override the base styles like so:

```html
<import src="./GroceryList.pc" as="GroceryList" />

<GroceryList.ListItem export component as="ListItem">
  <style>
    color: blue;
  </style>
  {children}
</GroceryList.ListItem>
```

All that's left is to set these styles on a JSX component:

```jsx

// Main JSX component
import { GroceryList } from "./GroceryList";

// Custom styles to define
import * as groceryListStyles from "./CustomGroceryList.pc";

<GroceryList items={["Milk", "Eggs", "Ham"]} styles={groceryListStyles} />
```

## Demo

This is a basic example that uses React, and Webpack. Source code can be found here: https://github.com/paperclipui/paperclip/tree/master/examples/react-basic.


<iframe src="https://codesandbox.io/embed/github/paperclipui/paperclip/tree/master/examples/react-basic?fontsize=14&hidenavigation=1&module=%2Fsrc%2FGroceryList.tsx&theme=dark"
     style={{width:"100%", height:500, border:0, borderRadius: 4, overflow:"hidden"}}
     title="react-basic"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>