---
id: guide-third-party-libraries
title: Using Third-party Libraries
sidebar_label: Third-party Libraries
---

## Third-party CSS

If you're using third-party CSS such as Bootstrap or Tailwind, you can just import them into your PC documents like so:

```html
<import src="./taiwind.css" inject-styles />

<div className="text-color-black-100 my-1">
  Something
</div>
```

The `inject-styles` attribute injects the document that the file is imported into -- it's still scoped. Other files that are imported into the doc are unaffected, which means
that you'll need to include your third-party CSS in each document that you'd like to style. 

The [Tailwind example](https://github.com/crcn/paperclip/tree/master/examples/tailwind) is a good place to start if you're looking to do this.

## Styling third-party HTML

you can style third-party HTML from Paperclip. Here's a simple example:

```html
<style>
  @export {
    .my-styles {

      /* some components may have nested style rules in the global namespace. 
      In that case you can use the :global selector */
      :global(.nested-rule) {

      }
    }
  }
</style>
```

Then, in your JSX code:

```jsx
import * as ui from "./Component.pc";
import SomeThirdPartyComponent from "some-third-paty-component";

<SomeThirdPartyComponent className={ui.classNames["my-style"]} />
```
