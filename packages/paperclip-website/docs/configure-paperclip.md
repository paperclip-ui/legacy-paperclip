---
id: configure-paperclip
title: Configuration
sidebar_label: Configuring
---

The `paperclip.config.json` contains information about linting rules, compiler options, and such. Here are all of the options that you can use:

```javascript
{

  // (required) directory where all of the Paperclip files live
  "srcDir": "./src",

  // (optional) paths to module directories
  "moduleDirs": ["node_modules"],

  // (optional) options for the target compiler "name"
  "compilerOptions": {

    // (optional) directory where PC files should be compiled to. Defaults to srcDir.
    "outDir": "./lib",
    
    // (optional) set this if you want to combine all CSS into one file
    "mainCSSFileName": "main.css"

    // (optional) embed assets directly into HTML up to this size
    "embedAssetMaxSize": -1,

    // (optional) where all of the assets are emitted to. Defaults to outDir.
    "assetOutDir": "./lib/assets"

    // prefix for all assets loaded into CSS & HTML
    "assetPrefix": "https://my-cdn.com",    

    // (optional) Use content hashes for assets when emitting to outDir. Default is true.
    "useAssetHashNames": true,
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