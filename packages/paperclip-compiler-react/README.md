

Installation: `npm install paperclip-compiler-react --save-dev`

This is a compiler that translates paperclip templates into React code. Here's an example template:

```html
<div export component as="default">
  Current count: {currentCount}
</div>
```

Here's the React code using the template:

```jsx
import BaseCounter from "./counter.pc";
import React, { useState } from "react";

export default () => {
  const [currentCount, setCount] = useState(0);
  const onClick = () => setCount(currentCount + 1);
  return <BaseCounter onClick={onClick} currentCount={currentCount} />;
};
```

#### classNames utility

The compiler exports `classNames` component that you can use to stylize elements outside of the template file. For example:

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

#### generating typed definition files

You'll need to install the CLI package: `npm install paperclip-cli --save-dev`. Assuming that you have a `pcconfig.json` file (see [paperclip-cli](../packages/paperclip-cli) docs for info), go ahead around run:

```
npx paperclip --definition --write
```

☝🏻 this will generate typed definition files that you can use in your react components.


> ✨ I recommend that you include `*.pc.d.ts` in your `.gitignore` file so to keep the typed definition files out of GIT. 


To watch for changes, you can do this:


```
npx paperclip --definition --write --watch
```

> Check out the [CLI docs](../paperclip-cli) for more info

#### Setting up with Webpack

Assuming that your PC config is pointing to `paperclip-compiler-react`, you can go ahead and follow the 
[paperclip-loader docs](../paperclip-loader)
