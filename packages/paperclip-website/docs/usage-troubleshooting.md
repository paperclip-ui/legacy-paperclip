---
id: usage-troubleshooting
title: Troubleshooting
sidebar_label: Troubleshooting
---

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
<import as="TextInput" src="./text-input.pc">

<style>
  .TextColorOverride {
    color: red;
  }
</style>

<TextInput className=">>>TextColorOverride" xsmall>
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
<import as="TextInput" src="./text-input.pc">

<style>
  .TextColorOverride {
    color: red;
  }
</style>

<TextInput className=">>>TextColorOverride" xsmall>
```

☝🏻 In this case, `TextColorOverride` properties will be applied. 
