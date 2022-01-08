---
id: guide-migrating-to-paperclip
title: Migration Code To And From Paperclip
sidebar_label: Migrating code
---

Migrating to and from Paperclip is easy since most of Paperclip's patterns are shared across different libraries.

###  Migrating from CSS 

You have a few options here. The easiest option is to just import CSS files directly into your document, for example:

```html
<import src="./tailwind.css" inject-styles />
<div export component as="font-sans">
  Some TW component
</div>
```

This requires _no_ migration effort, and allows you to maintain a boundary between your styles and Paperclip if you want to. If you want to move from CSS however, it's basically just copying and pasting. For example:

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

Just paste this like so:

```html
<style>
  .container {
    font-family: sans-serif;
    color: #333;
  }

  .content {
    padding: 10px;
  }
</style>

<div export component as="Container" class="container">
  {children}
</div>

<div export component as="Content" class="content">
  {children}
</div>
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
<import src="./theme.pc" as="theme" />
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

After migrating, all you need to do is change your styled component imports:

```jsx

// Change this:
// import { Button } from "./styles.tsx";

// To this: 
import { Button } from "./styles.pc";

// Everything else remains the same.
<Button />
<Button secondary />
```