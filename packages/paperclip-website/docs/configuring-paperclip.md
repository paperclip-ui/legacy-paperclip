---
id: configuring-paperclip
title: Configuring Paperclip
sidebar_label: Configuring Paperclip
---

Paperclip uses a `paperclip.config.json` file which provides information about your project, and how
to compile your `*.pc` files. Here's an example of what it might look like:


```json
{
  "compilerOptions": {
    "name": "paperclip-compiler-react"
  },
  "sourceDirectory": "./src"
}
```

### Options

- `compilerOptions` 
  - `name` is the name of the compiler to use that translates `*.pc` files into code.
- `sourceDirectory` is your where all of your `*.pc` files are.