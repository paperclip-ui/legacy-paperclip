---
id: guide-dynamic-styles
title: Dynamically changing Paperclip styles
sidebar_label: VS Code Extension
---

TODO

While Paperclip can cover _most_ of your UI, there will probably be edge cases where you need to compute styles using code. Here's 

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

