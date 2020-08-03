---
id: guide-why
title: Why Paperclip?
sidebar_label: Why Paperclip?
---

There are a number of reasons why Paperclip was created. 

### Web development is slow

One of the big reasons why Paperclip was created is to eliminate the refresh rate of web application previews. Here's what I mean:

![Slow HMR demo](/img/slow-hmr.gif)

> An example of using hot-module reloading for a large project running in a Docker container.

Web development is almost _entirely visual_, and also a very iterative process. All of that time spent tweaking CSS gets expensive, and personally I also find it to be a productivity drain. It really sucks to wait 5 seconds for the browser to see a preview each time a change is made. 

To a reach a _fidelity_ that designers want is another matter. There's usually a _lot_ of time spent getting styles just right, and it gets even harder to do when projects get bigger. At this point in my career, I've found it pretty normal for web applications to visually be _just about right_, but not entirely. There just isn't enough justification to making UI perfect. 

Paperclip was created primarily to increase visual development speed. Developers should be free to make user interfaces as fast as they can build them, and be unrestricted by their tooling. And with little effort, they should be able to iterate on their UIs for pixel-perfection. 

![alt faster UI](/img/faster-ui.gif)



### Visual regressions

Visual regressions are a really tough problem in the web development space, especially when you consider the _cascading_ nature of CSS. One small change to a style rule may introduce a new visual bug into your application. And when styles are global, I've noticed that developers that I've worked with don't feel _confident_ about making CSS changes, and so they leave it alone. What you're left with over time is a large accumulation of magical heaping pile of tech debt that you can't remove. To mitigate that from happening requires social rules around CSS, and that's hard to enforce in my experience, especially as teams grow. 

Granted, most of the cascading issues around CSS go away when you 1) bring CSS into code, and 2) use child selectors (`.ancestor .descendent`, `.parent > .child`) sparingly. However, visual regressions still happen often enough when you refactor code (e.g: changing the theme). The way to fix this problem is with a tool like [Percy](https://percy.io/) that does visual regression tests. However, that requires manual setup that's time-intensive, and requires lots of energy to make into a process. 

Confidence is a real concern of mine around developer tooling, and I've noticed that tools that are built around safety are only useful when they make an _entire_ system safe, not just parts of it. When you have blind spots in your codebase, developers may feel like don't know what's safe and what isn't, so it's safer to assume that nothing is. Visual regression test coverage is no exception - you really need a lot of them in order to feel safe from CSS bugs. 

Paperclip doesn't require you to set up visual regression tests since they're given to you automatically. That's because the language is centered around visual development - developers are encouraged to write previews of their components directly within Paperclip files, which in turn are used for visual regression tests. Take this button for example:

```html live
<style>
  .button {
    background: #333;
    border: 2px solid #333;
    border-radius: 4px;
    padding: 8px 16px;
    color: white;

    &--secondary {
      color: inherit;
      background: transparent;
    }
    &--negate {
      background: #C00;
      border-color: #C00;
    }
    &--negate&--secondary {
      background: transparent;
      color: #C00;
    }
  }
  .preview {
    margin: 10px;
  }
</style>
<button export component as="Button" 
  className="button {className?}"
  className:secondary="button--secondary"
  className:negate="button--negate">
  {children}
</button>

<Button className="preview">
  primary
</Button>

<Button className="preview" secondary>
  Secondary
</Button>

<Button className="preview" negate>
  Negate
</Button>

<Button className="preview" negate secondary>
  Negate Secondary
</Button>
```

☝ The previews here are primarily for the developer to see what they're doing. And by doing this, they're also getting visual regression tests, basically for free. All that needs to be done at this point is to run the [Percy CLI tool](configure-percy.md).

![alt percy button snapshot](/img/why/button-percy-demo.gif)

Here's what you see in Percy:

![alt percy snapshot](/img/why/percy-button-snapshot.png)

There's really no mistaking whether a button state is captured or not because each state needs to be displayed in order for the developer to _create_ it, and the developer is also encouraged to display every visual state of the component since that means they'll get visual regression tests. A nice little feedback loop. 


Assuming that we have the entire UI built in Paperclip, we can feel a bit more confident about making changes, which goes back to increasing the speed of developing web applications since a developers wouldn't need to smoke-test component style changes - it's done automatically for them. All they need to do is change a style and they're done. 