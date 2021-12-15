---
id: getting-started-installation
title: Project Installation
sidebar_label: Installation
---

This guide assumes that you're using **Webpack** and **React**.

Go ahead and run this command in your project directory (existing and new):

```
npx paperclip-cli init
```

### Webpack Setup

*If you're starting a new project, then you can skip this step*.

Documentation for this can be found in the [Webpack Integration](getting-started-webpack) page. The only thing you really need to configure is:

- `paperclip-loader` - compiles PC files to JSX.
- `style-loader` - required since Paperclip emits CSS.
- `css-loader` - required with style-loader.
- `file-loader` - required for CSS files that have `url()`'s in them & other media. 


### Create React App (CRA)

### TypeScript

If you're using TypeScript, you can generate Typed Definitions from Paperclip files by running:

```bash
yarn paperclip build --only=d.ts
```

This will write `*.pc.d.ts` files in in the same directory as their corresponding `*.pc` file. I'd also recommend that you include `*.pc.d.ts` in your `.gitignore` file.

☝ This command will generate definitions files based on the compiler you're using. So if you're using `paperclip-compiler-react`, then React
Typed Definition files will be generated for you. Configuration for the compiler can be found in the `paperclip.config.json`. 

<!-- ### NextJS Setup

> ⚠️ WIP ⚠️ -->



