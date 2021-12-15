---
id: usage-cli
title: CLI Usage
sidebar_label: CLI
---

The CLI tool is used primarily to compile Paperclip files into your target framework. 

## Installation

`npm install paperclip-cli --save-dev`

## Commands

### paperclip init

Configures Paperclip with your current project & installs compilers.

### paperclip build

Generates code based on your [paperclip config](configure-paperclip.md). 

**Options**

- `write` - Option to write compiled UI files to disk. Output is otherwise printed in the console log. Currently, files are written to the same directory as the `*.pc` files, so be sure to add `*.pc.*` to your `.gitignore`.
- `watch` - Starts the file watcher & rebuilds UIs whenever they change.
- `definition` - Generate a typed definition file (Specific to TypeScript)

**Examples**

```sh

# Build all Paperclip files and print to stdout
paperclip build --print

# Build Paperclip files & writes them
paperclip build

# Starts watcher & writes them whenever they change
paperclip build --watch

# Build and only emit the target files
paperclip build --onlyd.ts,css --watch
```

If you're using [Webpack](getting-started-webpack), then you probably don't need to run `paperclip build` since the paperclip loader handles that for you. 
