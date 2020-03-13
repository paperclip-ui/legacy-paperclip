

Installation: `npm install paperclip-compiler-react --save-dev`

This is a compiler that translates paperclip into React code. Here's an example template:

```html
<div export component as="Counter">
  Current count: {currentCount}
</div>
```

Here's the React code for adding behavior:

```jsx
import BaseCounter from "./counter.pc";
import React, { useState } from "react";

export default () => {
  const [currentCount, setCount] = useState(0);
  const onClick = () => setCount(currentCount + 1);
  return <BaseCounter onClick={onClick} currentCount={currentCount} />;
};
```

#### styled utility

The compiler exports a `styled` component that you can use to stylize elements outside of the template file. For example:

```html
<style>
  div {
    color: red
  }
</style>
```

In React, you can do this:

```jsx
import {styled} from "./template.pc";
const Div = styled('div');

export default () => {
  return <Div>
    This is red text
  </Div>;
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

This will print all typed definitions in terminal. To _write_ typed definition files to disc, you can run this:


```
./node_modules/.bin/paperclip --definition --write
```

> ✨ I also recommend that you include `*.pc.d.ts` in your `.gitignore` file so to keep the typed definition files out of GIT. 


To watch for changes, you can do this:


```
./node_modules/.bin/paperclip --definition --write --watch
```

> Check out the [CLI docs](../paperclip-cli) for more info

#### Setting up with Webpack

Assuming that your PC config is pointing to `paperclip-compiler-react`, you can go ahead and follow the 
[paperclip-loader docs](../paperclip-loader)