---
id: guide-dynamic-styles
title: Dynamically Changing Styles Using JavaScript
sidebar_label: Dynamic Styles
---

While Paperclip can cover _most_ of your UI, there will probably be edge cases where you need to compute styles using code. Here's an example Paperclip file:

```html live
<style>
  .progress {
    .bar {
      background: linear-gradient(to right, #F60, #00CC00);
      border-radius: 99px;
      height: 3px;
      box-sizing: border-box;
      transition: 1s ease-out;
    }
    margin: 4px;
    box-sizing: border-box;
  }
</style>

<!-- {style} must be explicity defined for it to be assignable to this element -->
<div export component as="Progress" class="progress">
  <div class="bar" style={barStyle} />
</div>

<!-- previews -->

<Progress barStyle="width: 50%" />
<Progress barStyle="width: 75%" />
<Progress barStyle="width: 100%" />
```

> This code can actually be done purely in CSS, but we'll just use it for this demo anyways. 

In JavaScript, we can simply add styles like so:

```typescript
import {Progress} from "./progress.pc";

<Progress barStyle={{ width: `${progress}%` }} />
```

That's just about it. Just pass a `style` attribute to Paperclip whenever you need to do styling in JavaScript. And be sure to expose `{style?}` in Paperclip, otherwise it won't work. If you need to styleize nested elements, you can do this:

```html
<div export component as="Something">
  <div style={myNestedStyle}>
  </div>
</div>
```
