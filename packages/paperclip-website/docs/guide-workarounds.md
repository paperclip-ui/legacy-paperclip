---
id: guide-workarounds
title: Workarounds
sidebar_label: Workarounds
---

Paperclip will require some finnessing for certain cases. 

## Using third-party CSS

If you're using third-party CSS such as Bootstrap or Tailwind, you'll need to move the CSS over
to a `*.pc` file. For example:

```css
.my-1 {
  /* tailwind code */
}

.my-2 {
  /* tailwind code */
}
```

Must be converted to Paperclip like so:


```css
<style>
  .my-1 {
    /* tailwind code */
  }

  .my-2 {
    /* tailwind code */
  }
</style>
```