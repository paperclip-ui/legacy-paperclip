---
id: guide-theming
title: Theming
sidebar_label: Theming
---

You can create multiple themes (such as `light`, and `dark`) for your app by putting them in a single `themes.pc` file that contains all of your color variables and other theming properties. For example:

```html
<style>
  @export {

    /* dark theme */
    .dark {
      --color-background-1: #333;
      --color-background-2: #444;
      --color-text-1: #FFF;
    }

    /* light theme */
    .light {
      --color-background-1: rgba(240, 240, 240, 1);
      --color-background-2: rgba(220, 220, 220, 1);
      --color-text-1: #333;
    }
  }
</style>
```

Then, be sure to reference these variables in each of your PC files:

```html
// file: button.pc
<import src="./theme.pc" as="theme" />
<style>
  .button {
    background: var(--color-background-1);
    color: var(--color-text-1);
    /* more CSS... */
  }
</style>

<div export component as="Button">
  {children}
</div>

<!-- more code... -->
```

After that, the only thing left to do is apply the theme to the component or any ancestor. If you're applying
your theme from app code, that might look something like this:

```jsx
import { classNames as themes } from "design-system/theme.pc"
import { Button } from "./button.pc";

export function App({darkMode}) {
  return <div className={darkMode ? themes.dark : themes.light}>
    <Button>
      I'm a themed button
    </Button>
  </div>;
}
```

## Safety around theming

We can add some safety around theming with [visual regresion tests](/docs/configure-percy) to ensure
that components are being stylized correctly, and that no CSS bugs are introduced. For that, I'd recommend you create theme variants for each of your components. Here's an example:


```html live
// file: button.pc
<import src="./theme.pc" as="theme" />
<style>
  .button {
    font-family: sans-serif;
    background: var(--color-background-1);
    color: var(--color-text-1);
    display: inline-block;
    border-radius: 2px;
    padding: 10px 20px;
  }
</style>

<div export component as="Button" 
  className="button"
  className:dark="$theme.dark"
  className:light="$theme.light">
  {children}
</div>

<Button light>Light button</Button>
<Button dark>Dark button</Button>
// file: theme.pc

<style>
  @export {

    /* dark theme */
    .dark {
      --color-background-1: #333;
      --color-background-2: #444;
      --color-text-1: #FFF;
    }

    /* light theme */
    .light {
      --color-background-1: rgba(240, 240, 240, 1);
      --color-text-1: #333;
    }
  }
</style>
```

As a rule of thumb, I'd recommend adding theme variants for _all_ components, not just some. That way you're more sure
to capture every component state with the visual regression tests. 

After that, all that's left to do is run `percy exec -- percy-paperclip`, and that will look for visual changes in each component that has a preview. That should help prevent CSS bugs. 