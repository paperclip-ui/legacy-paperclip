---
id: guide-migrating-to-paperclip
title: Migration Code To And From Paperclip
sidebar_label: Migrating Code
---

###  Migrating from CSS 

All you need to do is copy & paste CSS into a Paperclip file. Here's an example:

```css
.container {
  font-family: sans-serif;
  color: #F60;
  font-size: 18px;
}

.content {
  padding: 10px;
}
```

☝ After copying, wrap this stuff with `@export`:

```html
<style>
  @export {
    .container {
      font-family: sans-serif;
      color: #333;
    }

    .content {
      padding: 10px;
    }
  }
</style>
```
The `@export` allows for your selectors to be used in other documents. Without it, these styles 
would only work in the document the document they're defined in. 

From there you can start using your styles:

```html live
// file: demo.pc
<import src="./migrated-css.pc" as="migrated-css">

<div className="$migrated-css.container">
  <div className="$migrated-css.content"> 
    Some content!
  </div>
</div>

// file: migrated-css.pc

<style>
  @export {
    .container {
      font-family: sans-serif;
      color: #F60;
      font-size: 18px;
    }

    .content {
      padding: 10px;
    }
  }
</style>
```

###  Migrating from Styled Components, Emotion, etc

For the most part, translating styled components to Paperclip is a 1-1 map. Here's an example of some styled components:

```jsx
import styled from "styled-component";
import theme from "path/to/my/theme";

export const Button = styled.button`
  font-family: ${theme.fontFamily1};
  font-size: ${theme.fontSize1};
  padding: 8px 16px;
  border: 2px solid ${theme.borderColor1};
  display: inline-block;
  border-radius: 99px;
  ${({secondary}) => secondary ? `
    background: ${theme.backgroundAlt1};
    color: ${theme.textColorAlt1};
  ` : ""}
`;

```

The translation to Paperclip would be this:

```html live
// file: button.pc
<import src="./theme.pc" as="theme">
<style>
  .Button {
    font-family: var(--font-1);
    font-size: var(--font-size-1);
    padding: 8px 16px;
    border: 2px solid var(--border-color-1);
    display: inline-block;
    border-radius: 99px;
    &--secondary {
      background: var(--background-alt-1);
      color: var(--text-color-alt-1);
    }
  }
</style>

<button export component as="Button" 
  className="Button" 
  className:secondary="Button--secondary">
  {children}
</button>

<Button>
  Primary Button
</Button>

<Button secondary>
  Secondary Button
</Button>

// file: theme.pc

<style>
  :root {
    --font-1: Helvetica;
    --font-size-1: 18px;
    --text-color-1: #222;
    --border-color-1: #333;
    --background-alt-1: #333;
    --text-color-alt-1: #FFF;
  }
</style>
```

After migrating from Emotion / styled-components / etc, all you need to do is change your styled component imports:

```jsx

// Change this:
// import { Button } from "./styles.tsx";

// To this: 
import { Button } from "./styles.pc";

// Everything else remains the same.
<Button />
<Button secondary />
```