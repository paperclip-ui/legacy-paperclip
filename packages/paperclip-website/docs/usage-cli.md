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

Initializes Paperclip for a new or existing project. If you're starting a new project, the `init` command will all a few questions, then generate project files for you.

### paperclip build

Generates code based on your [paperclip config](configure-paperclip.md). 

**Options**

- `write` - Option to write compiled UI files to disk. Output is otherwise printed in the console log. Currently, files are written to the same directory as the `*.pc` files, so be sure to add `*.pc.*` to your `.gitignore`.
- `watch` - Starts the file watcher & rebuilds UIs whenever they change.
- `definition` - Generate a typed definition file (Specific to TypeScript)

**Examples**

```sh

# Build all Paperclip files and print to stdout
paperclip build 

# Build Paperclip files & writes them
paperclip build --write

# Starts watcher & writes them whenever they change
paperclip build --write --watch

# Start typed definition watcher
paperclip build --write --definition --watch
```

If you're using [Webpack](getting-started-webpack), then you probably don't need to run `paperclip build --write` since the paperclip loader handles that for you. 

If you're using [TypeScript](configure-typescript.md), then you'll probably want to use the `paperclip build --write --definition --watch` to generate typed definition files.

