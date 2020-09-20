---
id: usage-troubleshooting
title: Troubleshooting
sidebar_label: Troubleshooting
---

Not necessarily gotchas, but things to be aware of when you're using Paperclip.

## Can't override variant styles

You may be dealing with CSS specificity issues. Suppose that you have an input:

```html
<style>
  .input {
    &.xsmall {
      color: blue;
    }
  }
</style>

<input export component as="default" className="input {className?}" className:xsmall>
```

And then you have another component that's using TextInput:

```html
<import as="TextInput" src="./text-input.pc" />

<style>
  .TextColorOverride {
    color: red;
  }
</style>

<TextInput className="$TextColorOverride" xsmall>
```

☝🏻 `TextColorOverride` won't actually be applied. This is because to native CSS, the xsmall selector has a _higher priority_. Here's an example to illustrate this:

```html 
<style>
  .input.small {
    color: red;
  }
  .input-override {
    color: blue;
  }
</style>

<input type="text" class="input small input-override" value="I should be blue!">
```

> https://jsfiddle.net/hL20se4m/

☝🏻 This HTML has the same effect as our Paperclip UI code above. Basically, style rules that have more class & attribute selectors have a higher priority. 

#### How do you fix this?

Just flatten your variants. For example:

```html
<style>
  .input {
    &-xsmall {
      color: blue;
    }
  }
</style>

<input export component as="default" className="input {className?}" className:xsmall="input-xsmall">
```

And _then_ you can apply style overrides:


```html
<import as="TextInput" src="./text-input.pc" />

<style>
  .TextColorOverride {
    color: red;
  }
</style>

<TextInput className="$TextColorOverride" xsmall>
```

☝🏻 In this case, `TextColorOverride` properties will be applied. 

## CSS is being applied outside of Paperclip

The most common cause of this is if you have a CSS class name defined within Paperclip that is also defined globally
in your application. For example, here's a PC file:

```html
<style>

  /* very common name that could be defined globally, especially in third-party CSS */
  .header {

  }
</style>

<div className="header">
</div>
```

If you're coming from global CSS & have `.header` defined, then the template above will also catch that style. 

> The reason for this is because class names in Paperclip are compiled to _scoped_ + _global_ parts. `<div className="header">` for example is compiled to `<div className="_document-scope_header header">`. This is by design to allow for `:global` selectors to be applied when you need it. 

The fix for this is either:

- Remove the global CSS. I think this is preferrable since to me, I don't think there shouldn't be any global CSS to begin with (aside from edge cases).
- Use a prefix in your class names such as `_` (much like private `_` properties in JavaScript) to add some safety from this happening again. 