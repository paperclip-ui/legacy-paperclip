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
``

In React code, we can define our `onClick` handler like so:

```jsx
import * as styles from "./button.pc";

<styles.Button onClick={handleClick} />
```