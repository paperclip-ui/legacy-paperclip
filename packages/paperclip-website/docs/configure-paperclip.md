---
id: configure-paperclip
title: Configuration
sidebar_label: Configuring
---

The `paperclip.config.json` contains information about linting rules, compiler options, and such. Here's the typed definition:

```typescript
type PaperclipConfig = {

  // source directory where *.pc files live
  srcDir?: string;

  // directories where modules are stored
  moduleDirs?: string[];

  // options for the output settings
  compilerOptions?: CompilerOptions | CompilerOptions[];

  lintOptions?: LintOptions;
};

type CompilerOptions = {

  // target compiler to use. Default is all of the ones installed.
  target?: string;

  // Files for the target compiler to emit. E.g: [d.ts, js, css]
  emit?: string[];

  // where PC files should be compiled to. If undefined, then
  // srcDir is used.
  outDir?: string;

  // treat assets as modules. This is particularly useful for bundlers.
  importAssetsAsModules?: boolean;

  // Combine all CSS into this one file. If unspecified, then CSS files are generated
  // for each PC file
  mainCSSFileName?: string;

  // embed assets until this size. If -1, then there is no limit
  embedAssetMaxSize?: number;

  // output directory for non-PC files. If not specified, then srcDir
  // will be used
  assetOutDir?: string;

  // prefix for assets,
  assetPrefix?: string;

  useAssetHashNames?: boolean;
};

type LintOptions = {
  
  // flag CSS code that is not currently used
  noUnusedStyles?: boolean;

  // enforce CSS vars for these properties
  enforceVars?: string[];
};

```


### Basic example

At the bare minimum, it's recommended that you specify a `srcDir` like so:

```json
{
  "srcDir": "./src"
}
```

By default, files will be emitted to the same directory as your `*.pc` files. If you want, 
you can emit files to another directory like so:

```json
{
  "compilerOptions": {
    "outDir": "./lib"
  },
  "srcDir": "./src"
}
```


### Expanded example

Here's a bit more of an expanded example:

```json
{
  "srcDir": "./src",
  "moduleDirs": ["node_modules"],
  "compilerOptions": {
    "target": "react",

    // Only emit these files
    "emit": ["js", "d.ts", "css"],

    // compile files to this directory
    "outDir": "./lib",

    // Emit all assets (png, svg, css) to this directory
    "assetOutDir": "./lib/assets"

    // combine all CSS into this file
    "mainCSSFileName": "main.css",

    // embed all assets
    "embedAssetMaxSize": -1,
    "assetPrefix": "https://my-cdn.com",    
    "useAssetHashNames": true,
  },
  
  "lintOptions": {
    "noUnusedStyles": true,
    "enforceVars": [
      "font-family",
      "color"
    ]
  }
}
```

### Compiling to multiple directories

You may also specify **multiple** compiler targets within a Paperclip config file. For example:

```json
{
  "compilerOptions": [
    { "target": "react", "outDir": "./lib/react" },
    { "target": "html", "outDir": "./lib/html" }
  ],
  "srcDir": "./src"
}
```

If you're using TypeScript, you can leverage this behavior to generate typed definition files in your source directory. For example:


```json
{
  "compilerOptions": [

    // Emit compiled JS to the lib directory
    { "target": "react", "outDir": "./lib" },

    // // Emit d.ts in the source directory
    { "target": "react", "emit": ["d.ts"] }
  ],
  "srcDir": "./src"
}
```