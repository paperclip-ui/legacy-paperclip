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

Vendor lock-in with CSS frameworks can be a particularly sticky problem, largely because of the global nature of CSS. Once you pick a CSS library with a team of engineers, you can make a pretty good bet that you’ll be stuck with it forever <!--truncate-->- it just gets too mangled up with the codebase. This can make it a bit nerve-wracking to introduce *any* CSS framework, let alone one into an existing codebase where there's the risk of overriding existing styles. I think that a large chunk of this problem can be avoided by removing *global* aspect of CSS, this is where Paperclip is handy. 

[Paperclip](http://paperclip.dev) provides a way to keep HTML & CSS sandboxed & explicit. Here’s a basic example:

```html
<!-- src/atoms/typography.pc" -->
<style>
  
  /* everything within an @export block is accessible to other documents */
  @export {
  
    // apply default style rule
    * {
      font-family: Open Sans;
      font-size: 14px;
    }
  
    .bold {
      font-weight: 600;
    }
  
    h1 {
      font-size: 1.5em;
    }
  
    h2 {
      font-size: 1.3em;
    }
  
    .blue {
      color: blue;
    }
  
    .underline {
      text-decoration: underline;
    }
  
    .small {
      font-size: 1.5em;
    }
  }
  
  /* everything outside of an export block is private to this document */
  div {
    color: red;
  }
</style>

<div class="bold">
  I'm read text!
</div>
```

This file can be used in other documents like so:

```html
<import src="atoms/typography.pc" as="text" />

<!-- shorthand way of applying styles from another doc -->
<h1 class="$text blue underline">
  I'm a blue header!
</h1>

<!-- or we can be very specific about what styles are applied -->
<div class="$text.small $text.blue">
  I'm small blue text
</div>
```

And if you want, you can include the entire CSS scope of another document like so:

```html
<import src="atoms/typography.pc" inject-styles />

<h1 class="blue underline">
  I'm a blue header!
</h1>

<div class="small blue">
  I'm small blue text
</div>
```

This level of control can also be used with CSS frameworks. For example, here’s a Tailwind + Animate.css example:

```html
<!-- You can include CSS into the scope of this document -->
<import src="tailwind.css" inject-styles />

<!-- Or you can assign libraries to a specific namespace and use it throughout your doc -->
<import src="animate.css" as="animate" />

<div>
  <div class="h-screen bg-gradient-to-br from-blue-600 to-indigo-600">
    <form>
      <!-- animate in -->
      <div class="$animate animate__animated animate__bounceIn bg-white px-10 py-8 ...more classes...">
        <!-- More code here ... -->
      </div>
    </form>
  </div>
</div>
```

> You can play with this example live here: https://codesandbox.io/s/github/paperclipui/paperclip/tree/master/examples/tailwind-and-animate

Tailwind is only applied in this document, and you’re given absolute control *where* the library is used in your application. You can also use other libraries too like Bootstrap, Bulma, etc. Paperclip should make to easier to have control over any CSS framework. Suppose you want to move away from one? You can easily do that. For example, here's a bootstrap example:

```html
<import src="modules/bootstrap.css" as="bts" />

<button export component as="Button" class="$bts btn-small btn-default">
</button>
```

Suppose you want to switch over to Tailwind, here's an example of how to do that:

```html

<import src="modules/tailwind.css" as="tw" />
<import src="modules/bootstrap.css" as="bp" />

<button export component as="Button" class:bts="$bts btn-small btn-default" class:tw="$tw btn">
  {children}
</button>


<Button bts>
  I'm a Bootstrap button
</Button>

<Button tw>
  I'm a Tailwind button
</Button>
```

here's what this looks like:



The `class:variant` syntax gives you a way to define variant styles on any element. We're using it above between Bootstrap and Tailwind to make sure that they don't clobber each other, and _also_ because the styles are slightly different. Chances are I'll probably want to use this same pattern in the _rest_ of the application, and then assign them to a feature flag switch that turns bootstrap off and tailwind on when migration is finished.




Paperclip should make it easy to keep them in isolation from the rest of your app. Paperclip should also allow you to more easily experiment with new libraries without worrying about them leaking into other parts of your application. You could even use multiple libraries together without worrying about them colliding with each other
