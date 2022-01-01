---
title: Using Paperclip to avoid vendor lock-in
description: How to use Paperclip to 
slug: avoiding-vendor-lock-in-with-paperclip
authors:
  - name: Craig Condon
    title: Creator of Paperclip
    url: https://github.com/crcn
    image_url: https://github.com/crcn.png
tags: [howto]
image: https://i.imgur.com/mErPwqL.png
hide_table_of_contents: false
draft: true
---

Vendor lock-in with CSS frameworks can be a particularly sticky problem, largely because of the global nature of CSS. Once you pick a CSS library, you can make a pretty good bet that you’ll be stuck with it forever <!--truncate-->- it just gets too mangled up with the codebase. This can make it a bit nerve-wracking to introduce *any* CSS framework, let alone one into an existing codebase. I think that a large chunk of this problem can be avoided by removing *global* aspect of CSS, this is where Paperclip is handy. 

[Paperclip](http://paperclip.dev) provides a way to keep HTML & CSS sandboxed in a single file that you can use anywhere in your application. Here’s a basic example:

```html
<!-- src/hello.pc" -->

<!-- styles are only applied to this doc -->
<style>
  div {
    color: red;
  }

  /* class names be made accessible to other files using @export */
  @export {
    .font-regular {
      font-family: Open Sans;
      font-size: 14px;
    }
  }
</style>

<!-- you can export primitive components that are usable anywhere in your app -->
<div export component as="Hello">
  {children}
</div>
```

Assuming that you’re using JSX, you can use these styles like so:

```jsx
import {classNames, Hello} from "./hello.pc";

<div className={classNames["font-regular"]}>
  <Hello>Hello World!</Hello>
</div>
```

When it comes to CSS frameworks, Paperclip is useful since it *scopes* CSS libraries to the files where they’re imported into*.*  For example, here’s Tailwind used with Paperclip:

```html
<!-- src/Card.pc -->

<!-- This imported CSS is scoped to this document -->
<import src="./styles/tailwind.css" inject-styles />

<!-- -->
<figure export component as="Card" class="font-sans md:flex bg-gray-100 rounded-xl p-8 md:p-0 dark:bg-gray-800">
  <div style="--background:url({profileUrl})" class="w-24 h-24 md:w-48 md:h-auto md:rounded-none rounded-full mx-auto">
    <style>
      background-image: var(--background);
      background-size: 100%;
      width: 512px;
    </style>
  </div>
  <div class="pt-6 md:p-8 text-center md:text-left space-y-4">
    <blockquote>
      <p class="text-lg font-medium">
        {description}
      </p>
    </blockquote>
    <figcaption class="font-medium">
      <div class="text-sky-500 dark:text-sky-400">
        {name}
      </div>
      <div class="text-gray-700 dark:text-gray-500">
        {title}
      </div>
    </figcaption>
  </div>
</figure>
```

> You can play with this example live here: [SANDBOX URL]
> 

Tailwind is only applied in this document, and you’re given absolute control *where* the library is used in your application. If you don’t want to use Tailwind, you don’t have to. For example, suppose we have another Paperclip file in the same codebase:

```html
<!-- src/test.pc -->

<style>
  .font-medium {
    font-family: Open Sans;
    font-size: 14px;
  }
</style>

<div class="font-medium">
  {children}
</div>
```

If we were to use this file, the only rule that’s applied to the `div` is the `font-medium` style in this doc, even though `font-medium` is *also* defined in Tailwind. 

Paperclip can scope other CSS libraries, Tailwind is just used as an example here. You can use Bootstrap, Bulma, or just about anything else. Paperclip should make it easy to keep them in isolation from the rest of your app. Paperclip should also allow you to more easily experiment with new libraries without worrying about them leaking into other parts of your application. You could even use multiple libraries together without worrying about them colliding with each other
