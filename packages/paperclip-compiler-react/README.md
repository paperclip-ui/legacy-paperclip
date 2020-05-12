

Installation: `npm install paperclip-compiler-react --save-dev`

This is a compiler that translates paperclip templates into React code. Here's an example template:

```html
<div export component as="Counter">
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

You'll need to install the CLI package: `npm install paperclip-cli --save-dev`. Next in your `pcconfig.json` file, change it to reflect this:

```javascript
{
  "compilerOptions": {
    "name": "paperclip-compiler-react"
  }
  // more config ...
}
```

Next, assuming that your PC config also has `filesGlob` set up, go ahead and run this in terminal:

```
./node_modules/.bin/paperclip --definition
```

This will print all typed definitions. To save typed definition files, you can run this:


```
./node_modules/.bin/paperclip --definition --write
```

> ✨ I recommend that you include `*.pc.d.ts` in your `.gitignore` file so to keep the typed definition files out of GIT. 


To watch for changes, you can do this:


```
./node_modules/.bin/paperclip --definition --write --watch
```

> Check out the [CLI docs](../paperclip-cli) for more info

#### Setting up with Webpack

Assuming that your PC config is pointing to `paperclip-compiler-react`, you can go ahead and follow the 
[paperclip-loader docs](../paperclip-loader)