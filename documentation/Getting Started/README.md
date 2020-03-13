

For the Alpha version of Paperclip, you'll need this stuff:

- VS Code. If you don't have this, you can use HMR.
- React
- Webpack

So, assuming you have everything you need, here's what you do next:

1. Install the [VS Code extension](https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode-extension).
1. With VS Code open, create a `hello-world.pc` & open it.
1. You'll see a popup to open a live preview. Click OK.
1. Start typing away!

At this point you should start seeing the preview update while you type. Next you'll probably want to start writing
_actual_ features. Let's start with something simple. Add this to your `hello-world.pc` file:

```html
<style>
  div {
    font-family: Helvetica;
    color: magenta; /* the best color */
  }
</style>

<!-- this defines group of elements that you can use in app code -->
<div export component as="Message">
  Hello {message}!
</div>

<!-- This is your component preview -->
<Message>
  Mundo
</Message>
```

> For more on documentation on how to write templates, check out the [syntax document](../syntax).

Let's walk through each part of this example.

```html
<style>
  div {
    font-family: Helvetica;
    color: magenta; /* the best color */
  }
</style>
```


