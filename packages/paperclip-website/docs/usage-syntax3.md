---
id: usage-syntax2
title: Paperclip Syntax
sidebar_label: Syntax
---



## Fragments

Fragments are useful if you want to render a collection of elements. For example:

```html
<ul component as="List">
  {listItems}
</ul>

<List
  listItems={<fragment>
    <li>feed fish</li>
    <li>feed cat</li>
    <li>feed me</li>
  </fragment>}
/>
```
