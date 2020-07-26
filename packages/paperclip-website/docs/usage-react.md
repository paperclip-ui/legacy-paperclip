---
id: usage-react
title: Using Paperclip in React apps
sidebar_label: React
---


## Installation

> You can skip this step if you set up a new Paperclip project using the [CLI tool](usage-cli.md).

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

After that, you're good to go!

## Using Paperclip UIs in React code

Assuming that you've installed the React compiler & have set up Webpack to use Paperclip, you can just import `*.pc` directly into your React code:

```tsx
import * as ui from "./counter.pc";
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


## Accessing Paperclip class names

The compiler exports as `classNames` property that you can use to stylize elements outside of the UI file. For example:

```html
<style>
  .my-style {
    color: red
  }
</style>
```

In React, you can do this:

```jsx
import {classNames} from "./template.pc";

export default () => {
  return <div className={classNames['my-style']}>
    This is red text
  </div>;
};
```

## How to add styles to Paperclip UIs

There will be some cases where you might want to add more behavior around styling than what Paperclip can do. For that you can just use inline styles. Here's an example:

```html live
<style>
  .progress {
    background: linear-gradient(to right, #F60, #00CC00);
    border-radius: 99px;
    height: 3px;
    margin: 4px;
  }
</style>

<!-- {style} must be explicity defined for it to be assignable to this element -->
<div export component as="Progress" class="progress" {style?}>
</div>

<!-- previews -->

<Progress style="width: 50%" />
<Progress style="width: 80%" />
<Progress style="width: 100%" />
```

Then in JavaScript:

```typescript
import {Progress} from "./progress.pc";

<Progress style={{ width: `${progress}%` }} />
```


## Generating typed definition files


If you're using TypeScript, you can generate typed definition files using the Paperclip CLI tool. If you don't already have it installed, go ahead and run:

```sh
npm install paperclip-cli --save-dev
```

Then after that, run:

```sh
npx paperclip build --definition --write
```


☝🏻 this will generate typed definition files that you can use in your react components.


> ✨ I recommend that you include `*.pc.d.ts` in your `.gitignore`.


To watch for changes, you can do this:


```
npx paperclip build --definition --write --watch
```

> Check out the [CLI docs](usage-cli.md) for more info
