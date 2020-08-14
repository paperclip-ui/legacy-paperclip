---
id: configure-paperclip
title: Paperclip Configuration
sidebar_label: Paperclip Config
---

Paperclip looks for a `paperclip.config.json` file which provides information about your project, and how
to compile your `*.pc` files. It typically lives in your project root directory alongside your `package.json` file.

Here's an example of what it might look like:


```javascript
{

  // options for the target compiler "name"
  "compilerOptions": {

    // compiler that translate `*.pc` files into the target framework. 
    "name": "paperclip-compiler-react"
  },

  // (optional) directory where JS & CSS files are compiled to
  "outputDirectory": "./lib",

  // directory where all of the Paperclip files live
  "sourceDirectory": "./src",

  // paths to module directories
  "moduleDirectories": ["node_modules"]
}
```