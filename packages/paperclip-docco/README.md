Paperclip documentation generator - very much a WIP. Features:

- Generate static HTML documentation
- Open documentation tool in live-view
- live editing? (PC would need to support markdown)


Example of documentated Paperclip code:

```html
<style>
  /*

  All shades of green

  @group atoms / colors / green
  */

  :root {
    --color-green-default: green;
    --color-green-100: dark-green;
  }

  /*

  All shades of red

  @group atoms / colors / red
  */

  :root {
    --color-red-default: red;
    --color-red-100: darker-red;
  }

  /*

  All shades of red

  @group atoms / colors / red
  */

  :root {
    --color-black-default: black;
    --color-black-100: #333;
  }

  /*

  Auto-generated from theme config

  @group atoms / colors / black / font color

  */

  @export {
    .color-black-default {
      color: var(--color-black-default);
    }
  }
  

  /*
  default fonts

  @group atoms / typography
  */

  @export {
    @mixin font-default {
      font-family: Helvetica;
      font-weight: 100;
      color: var(--color-black-default);
    }

    .font-default {
      @include font-default;
    }
  }

</style>

<!--
  A simple button
  @group molecules / button
-->

<button export button as="Button" className="font-default color-black-default">
  {children}
</button>
```
