---
id: installation
title: Installation
sidebar_label: Installation
---

To get started with Paperclip, just run this command in your project directory:

```
npx paperclip init
```

This will walk you through the setup process that will ask you to pick a target compiler (React, PHP, etc). After that, create a new `hello-paperclip.pc` file with the following content:

```html
<div export component as="HelloPaperclip">
  <style>
    font-family: Comic Sans MS;
  </style>
  {children}!
</div>
```

Then just run this command:

```
npx paperclip build --write
```

That's it! At this point you should see a generated file that you can import directly into your application code.

