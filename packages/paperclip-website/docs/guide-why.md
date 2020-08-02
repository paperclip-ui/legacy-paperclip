---
id: guide-why
title: Why Paperclip?
sidebar_label: Why
---

There are a number of reasons why Paperclip was created. 

### Web development is slow 

The main one is out of the frustration around how slow and inefficient web development generally is. The endless loop around writing HTML & CSS & debugging in the browser is  bottleneck to the development process.

![Slow HMR demo](/img/slow-hmr.gif)

<!-- take about refresh speed - DX -->

<!-- need to introduce Paperclip, then take advantage of situation -->

I find that most React components are incredibly simple. Most of the time they render basic HTML & CSS that HTML & CSS alone can handle. Rarely is there a need for more complicated behavior. That, and I've found that a lot of codebases separate primitive styled components from logic anyways, so why not take advantage of that separation? By using a tool that's special-purpose for writing HTML & CSS, we can eliminate the browser refresh issue entirely, and also introduce _new_ tooling to optimize the developer experience around HTML & CSS development. That's why Paperclip was created.

![alt faster UI](/img/faster-ui.gif)

Paperclip is a special-purpose tool for creating UI building blocks that you can use in your code. And because it's limited to such a small part of your codebase (HTML & CSS), it's fast, and _remains_ fast as your project grows in size. 


### Visual regressions

Visual regressions are a really tough problem in the web development space, especially when you consider the _cascading_ nature of CSS. One small change to a style rule may introduce a new visual bug into your application. And because styles are can be global, I've noticed that developers that I've worked with don't feel _confident_ about making CSS changes, and so they leave it alone. What you're left with over time is a large accumulation of magical styles that nobody quite knows what to do with. To prevent that from happening requires social rules around CSS, and that's hard to enforce in my experience, especially as teams grow. 

Granted, most of the cascading issues around CSS go away when you 1) bring CSS into code, and 2) use child selectors (`.ancestor .descendent`, `.parent > .child`) sparingly. However, visual regressions still happen often enough when you refactor code (e.g: changing the theme). The way to fix this problem is with a tool like [Percy](https://percy.io/) that does visual regression tests. However, that requires manual setup that's time-intensive, and requires lots of energy to enforce. 

Confidence is a real concern of mine around developer tooling, and I've noticed that tools that are built around safety are only useful when they make an _entire_ system safe, not just parts of it. When you have blind spots in your codebase, developers don't know what's safe and what isn't, so it's safer to assume that nothing is. Visual regression test coverage is no exception - you really need a lot of them in order to be safe from CSS bugs. 

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

☝ The previews here are primarily for the developer to see what they're doing. And by doing this, they're also getting visual regression tests, basically for free. All that needs to be done at this point is run the [Percy CLI tool](configure-percy.md).

![alt percy button snapshot](/img/why/button-percy-demo.gif)

Here's what you see in Percy:

![alt percy snapshot](/img/why/percy-button-snapshot.png)

There's really no mistaking whether a button state is captured or not because each state needs to be displayed so that the developer can _create_ the button, and the developer is also encouraged to display every visual state of the component since that means they'll get visual regression tests. A nice little feedback loop. 

Assuming that we have the entire UI built in Paperclip, we can fill a bit more confident about making changes, which goes back to increasing the speed of developing web applications since a developers wouldn't need to smoke-test component style changes - it's done automatically for them. 