---
id: usage-react
title: Using Paperclip In React Apps
sidebar_label: React
---


⚠️ This doc assumes that you've already set up Paperclip with your project. If you haven't done that already, check out the [Getting Started](getting-started-webpack) section.

## Importing *.pc files

Assuming that you have the correct loaders set up, you can just import `*.pc` files like regular JavaScript modules. For example:

```tsx

// I like to keep all of the styles in a single namespace
// to communicate that `ui.ComponentName` is a primitive comming from
// a Paperclip file. 
import * as ui from "./counter.pc";

// Another option
// import * as styles from "./counter.pc";

import React, { useState } from "react";

export default () => {
  const [currentCount, setCount] = useState(0);
  const onClick = () => setCount(currentCount + 1);
  return <ui.Container onClick={onClick}>
    <ui.CurentCount>{currentCount}</ui.CurrentCount>
  </ui.Container>;
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

<div export component as="Container" className="container">
  Current count: {children}
</div>
<div export component as="CurrentCount" className="current-count">
  {children}
</div>

<!-- Previews -->

<Container>
  <CurrentCount>
    50
  </CurrentCount>
</Container>
```

Note that in order to import components from Paperclip files, they'll each need their own `export` attribute. 


## classNames

Styles defined in `*.pc` files are scoped, so if you want access to one of those styles outside of that file, you'll need to 
use `classNames`. 

**Syntax**

```javascript
import * as ui from "./counter.pc";
<div className={ui.classNames["classname-defined-in-paperclip"]} />
```

Note that you need to _explicitly_ export `classname-defined-in-paperclip` within your Paperclip document using [@export](usage-syntax.md#export), otherwise it's 
not accessible. 

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
> The `?` in `{onClick?}` flags the prop as optional.

In React code, we can define our `onClick` handler like so:

```javascript
import * as styles from "./button.pc";

<styles.Button onClick={handleClick} />
```
