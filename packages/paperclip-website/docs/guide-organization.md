---
id: guide-organization
title: Organizing Paperclip components
sidebar_label: Organization
---

The general structure that I'd recommend is:

```html
<!-- styles section -->

<style>
  /* your styles */
</style>

<!-- Component building blocks section -->

<div export component as="SomeComponent">
  {children}
</div>

<div export component as="AnotherComponent">
  {children}
</div>

<!-- Preview section -->

<SomeComponent>
  <AnotherComponent />
</SomeComponent>

<!-- another preview -->

<SomeComponent>
  <AnotherComponent />
  <AnotherComponent />
  <AnotherComponent />
</SomeComponent>
```

<!-- Organizing styles & components is another matter. I don't necesarily have a pattern to that I'd recommend, but I do have a workflow that I think allows for organization to sort-of organically happen. Check out the [Writing Components](/docs/writing-components) doc for that.  -->

# Organizing files

Generally, I'd recommend keeping `*.pc` files in the same directories as the components that are using them. Here's an example structure:


```bash
components/

  # Common components that are re-used throughout the app
  common/

    # PC & TSX files are named the same because 
    # the file system automatically displays them together.
    Button.pc
    Button.tsx
    ButtonGroup.pc
    ButtonGroup.tsx
    TextInput.pc
    TextInput.tsx
    Popup.pc
    Popup.tsx

    # Using a directory here to group components together that are
    # only used in ColorPicker
    ColorPicker/
      index.pc
      index.tsx
      Dropper.pc
      Dropper.tsx

```

Another option:

```bash
components/
  common/

    Button.tsx

    # adding "-styles" to communicate that styles go here. 
    # Still prefixing with the component name so that the file system lists them together. 
    Button-styles.pc
    ButtonGroup.tsx
    ButtonGroup-styles.pc
    ...
    ColorPicker/
      index.tsx

      # prefix with "indexed" so that the FS can automatically organize.
      index-styles.pc
```



There are many ways to do this, but I always keep `*.pc` files next to their corresponding `*.tsx` file, and name them about the same - it's an easy rule to follow that works well. 

There will be cases where you'll need to re-use PC files across mutiple components or other PC files. Some examples of this would be: `typography.pc`, `colors.pc`, and other files that contain your app's core design tokens. For organizing those, I think you're fine putting them into your common components directory since your components are going to be the only things using them. 

> PC files also _do_ export components, so I think it's better to keep organization simple and just classify them the same as your regular components. 