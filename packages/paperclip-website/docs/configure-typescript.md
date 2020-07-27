---
id: configure-typescript
title: TypeScript Usage
sidebar_label: TypeScript
---

Paperclip UIs can compile down typed defnition files that you can use in your TypeScript project. To do this, you'll need to install the [CLI tool](usage-cli.md). You'll also need a `paperclip.config.json` file.  Assuming you have both of those things, just run:

```sh
paperclip build --definition --write
```

☝🏻 This will generate `*.pc.d.ts` files. I'd recommend that you include this script in your `package.json`:

```json
{
  "name": "react-todomvc",
  "main": "index.js",
  "scripts": {
    "build": "npm run build:definitions && npm run build:webpack",
    "build:watch": "npm bun build:definitions -- --watch & npm run build:webpack -- --watch",
    "build:webpack": "webpack",
    "build:definitions": "paperclip build --definition --write"
  }
}
```

I'd also recommend including `*.pc.d.ts` in your `.gitignore`. 