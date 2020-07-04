CLI tool for compiling paperclip templates.

**Installation: `npm i paperclip-cli --save-dev`**

#### Examples

```

# show general help menu
paperclip help 

# show command help menu
paperclip [command] help

# build paperclip files with pcconfig.json from current directory
paperclip build

# build typed definition files & start file watcher
paperclip build --definition --watch
```

#### Setup

To initialize a new project, run `paperclip init`. This will ask you a few questions, then write a `pcconfig.json` file that the
compiler will use.

> Documentation for `pcconfig.json` can be viewed [here](../../documentation/Paperclip%20Config).

Next, add a `.pc` file with the following content:

```html
<div export component as="Test">
  {children}
</div>
```

then run:

```bash
npx paperclip build --write
```

☝🏻This will compile your paperclip file to JavaScript code. Alternatively, you can generate TypeScript definition files with
the following command:

```bash
npx paperclip build --write --definition
```

☝🏻This is useful if you're using Paperclip within a TypeScript project. If you're doing that, I recommend you add this
command a s a script in your package.json file. For example:

```javascript
{
  "name": "my-module-name",
  "scripts": {
    "build:paperclip-definitions": "paperclip build --definition --write",
    "build:watch:paperclip-definitions": "paperclip build --definition --write --watch",
  }
}
```


