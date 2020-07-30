---
id: guide-writing-components-quickly
title: Writing Components Efficiently
sidebar_label: Writing Components Efficiently
---


I think an easy way to start writing components is to simply write the HTML & CSS first. This involves writing a lot of redundant code up front, but seeing how all of the HTML & CSS is rendered will allow us to indentify what to componentize exactly.

Let's use a simple website:

```html live
<style>
  .header {

  }
</style>


```

This approach is fast & simple. The components also reveal themselves. Here they are:

☝🏻 This much doesn't require much thought. It's a lot of copy & paste, but that  and now we can physically _see_ where the boundaries are for components. Now we can start slicing things up into re-usable components.