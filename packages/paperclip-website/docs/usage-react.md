---
id: usage-react
title: Using Paperclip In React Apps
sidebar_label: React
---

## Installation

To use Paperclip in React, you'll need to install the compiler first:

```sh
npm install paperclip-compiler-react --save-dev
```

Then in your `paperclip.config.json` file, change `compilerOptions.name` to look like:

```json
{
  "compilerOptions": {
    "name": "paperclip-compiler-react"
  },
  "sourceDirectory": "./src"
}
```

After that you're good to go! From there you can start importing UI files into your app by either using [Webpack](configure-webpack.md), or by using the [CLI tool](usage-cli.md) to generate JavaScript files. 

## Importing *.pc files

Think of `*.pc` files like any other JavaScript file. Just import them directly like so:

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
   .Container {
     font-family: Helvetica;
     cursor: pointer;
   }
   .CurrentCount {
     font-weight: 400;
   }
</style>

<!-- Components -->

<div export component as="Container" className="Container">
  Current count: {children}
</div>
<div export component as="CurrentCount" className="CurrentCount">
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
