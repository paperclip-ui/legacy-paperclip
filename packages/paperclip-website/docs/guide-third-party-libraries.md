---
id: guide-third-party-libraries
title: Using Third-party Libraries
sidebar_label: Third-party libraries
---

## Third-party CSS

If you're using third-party CSS such as Bootstrap or Tailwind, you can just import them into your PC documents like so:

```html
<import src="./taiwind.css" inject-styles />

<div className="text-color-black-100 my-1">
  Something
</div>
```

The `inject-styles` attribute allows for CSS to be accessible in a document without needing to use a namespace. Keep in mind that styles are only accessible in the document where `inject-styles` is applied, so if you're looking to use CSS throughout your app, you'll need to import that CSS explicitly in every document where you'd like to use it.

The [Tailwind example](https://github.com/paperclipui/paperclip/tree/master/examples/tailwind) is a good place to start if you're looking to do this.

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

Then, in your application code:

```jsx
import * as ui from "./Component.pc";
import SomeThirdPartyComponent from "some-third-paty-component";

<SomeThirdPartyComponent className={ui.classNames["my-style"]} />
```
