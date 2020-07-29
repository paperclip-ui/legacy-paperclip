---
id: guide-dynamic-styles
title: Dynamically Changing Styles Using JavaScript
sidebar_label: Dynamic Styles
---

While Paperclip can cover _most_ of your UI, there will probably be edge cases where you need to compute styles using code. Here's an example Paperclip file:

```html live
<style>
  .progress {
    background: linear-gradient(to right, #F60, #00CC00);
    border-radius: 99px;
    height: 3px;
    margin: 4px;
    transition: 1s ease-out;
  }
</style>

<!-- {style} must be explicity defined for it to be assignable to this element -->
<div export component as="Progress" class="progress" {style?}>
</div>

<!-- previews -->

<Progress style="width: 50%" />
<Progress style="width: 75%" />
<Progress style="width: 100%" />
```

> This code can actually be done purely in CSS, but we'll just use it for this demo anyways. 

In JavaScript, we can simply add styles like so:

```typescript
import {Progress} from "./progress.pc";

<Progress style={{ width: `${progress}%` }} />
```

That's just about it. Just pass a `style` attribute to Paperclip whenever you need to do styling in JavaScript. And be sure to expose `{style?}` in Paperclip, otherwise it won't work. If you need to styleize nested elements, you can do this:

```html
<div export component as="Something">
  <div style={myNestedStyle}>
  </div>
</div>
```
