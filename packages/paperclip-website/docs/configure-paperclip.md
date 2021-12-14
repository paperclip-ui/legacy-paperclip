---
id: configure-paperclip
title: Configuration
sidebar_label: paperclip.config.json
---

Paperclip looks for a `paperclip.config.json` file which provides information about your project, and how
to compile your `*.pc` files. It typically lives in your project root directory alongside your `package.json` file.

Here's an example of what it might look like:


```javascript
{

  // directory where all of the Paperclip files live
  "srcDir": "./src",

  // paths to module directories
  "moduleDirs": ["node_modules"],

  // options for the target compiler "name"
  "compilerOptions": {

    // directory where PC files should be compiled to. Defaults to srcDir
    "outDir": "./lib",
  },
  
  "lintOptions": {

    // Flag styles that aren't used 
    "noUnusedStyles": true,

    // ensure that these CSS properties are always using variables.
    "enforceVars": [
      "font-family",
      "color"
    ]
  }
}
```