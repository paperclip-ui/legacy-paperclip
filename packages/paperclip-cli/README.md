CLI tool for compiling paperclip templates.

**Installation: `npm i paperclip-cli --save-dev`**

#### Usage

```
Options:
  --help      Show help                                                [boolean]
  --version   Show version number                                      [boolean]
  --compiler  Language compiler target
  --write     Write compiled file
  --config    Config file
  --watch
```

#### Setup

The easiest way to get setup is to first define a `pcconfig.json` file:

```javascript
{
  "compilerOptions": {

    // Code compiler to use
    "name": "paperclip-react-compiler"
  },

  //
  "filesGlob": "**/*.pc"
}
```

> Documentation for `pcconfig.json` can be viewed [here](../../documentation/Paperclip%20Config).

After setting your config up, open terminal and `cd` to the directory of the `pcconfig.json`, then run:

```bash
paperclip
```

☝️ This should generate code for you in the `stdout`. To _write_ code to disc, just run:

```bash
paperclip --write
```

☝️ This will write JS files in the same directories as the PC files.

The `paperclip-react-compiler` module has the ability to generate `*.d.ts` files if you're using TypeScript. To use that output you can simply run:

```bash
paperclip --definition --write
```

To start the file watcher, you can run:

```bash
paperclip --definition --write --watch
```

☝🏻 This starts a file watcher that saves typed definition files whenever they change. This command specifically pairs nicely with other build scripts. If for example you're using Webpack, you could do something like this in your `package.json`:

```javascript
{
  "name": "my-module-name",
  "scripts": {
    "build": "npm run build:definitions && build:dist",
    "build:dist": "webpack",
    "build:watch": "npm run build:definitions -- --watch & npm run build:dist -- --watch",
    "build:definitions": "paperclip --definition --write",
  }
}
```


