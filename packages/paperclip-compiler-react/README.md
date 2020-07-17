

Installation: `npm install paperclip-compiler-react --save-dev`

This is a compiler that translates paperclip templates into React code. Here's an example PC file:

```html
<style>
   .counter {
     font-family: Helvetica;
     cursor: pointer;
   }
   .current-count {
     font-weight: 400;
   }
</style>

<!-- Components -->
<div export component as="default">
  Current count: {children}
</div>
<div export component as="CurrentCount">
  {children}
</div>

<!-- Previews -->

<default>
  <CurrentCount>
    50
  </CurrentCount>
</default>
```

Here's how you use the above file in React:

```jsx
import Counter, {CurrentCount} from "./counter.pc";
import React, { useState } from "react";

export default () => {
  const [currentCount, setCount] = useState(0);
  const onClick = () => setCount(currentCount + 1);
  return <Counter onClick={onClick}>
    <CurrentCount>{currentCount}</CurrentCount>
  </Counter>;
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

#### How do I add dynamic styles?

There will be some cases where you might want to add more behavior around styling than what Paperclip can do. For that I'd recommend just using inline styles. Here's an example:

```html
<style>
  .progress {
    background: #333;
    border-radius: 99px;
    height: 3px;
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


#### generating typed definition files

You'll need to install the CLI package: `npm install paperclip-cli --save-dev`. Assuming that you have a `paperclip.config.json` file (see [paperclip-cli](../packages/paperclip-cli) docs for info), go ahead around run:

```
npx paperclip build --definition --write
```

☝🏻 this will generate typed definition files that you can use in your react components.


> ✨ I recommend that you include `*.pc.d.ts` in your `.gitignore` file so to keep the typed definition files out of GIT. 


To watch for changes, you can do this:


```
npx paperclip build --definition --write --watch
```

> Check out the [CLI docs](../paperclip-cli) for more info

#### Setting up with Webpack

Assuming that your PC config is pointing to `paperclip-compiler-react`, you can go ahead and follow the 
[paperclip-loader docs](../paperclip-loader)
