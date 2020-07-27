---
id: configure-percy
title: Setting up visual regression tests
sidebar_label: Percy
---

## Installation

Paperclip integrates with [Percy](https://percy.io) to allow you test for CSS bugs in your Paperclip UI files. To get started, install the NPM module:

```
npm install percy percy-paperclip --save-dev
```

Next, grab your percy token, then run the following command in the same directory as your `paperclip.config.json` file:


```bash
PERCY_TOKEN=[TOKEN] percy exec -- percy-paperclip
```

After that, you should see something like this:

![Percy demo](/img/snapshot.gif)


## Setting up with GitHub actions

`percy-paperclip` pairs nicely with GitHub actions, especially for PR checks. Here's a GitHub action you can use: 

```yml
name: PR Checks
on:  
  pull_request

jobs:
  visual-regression-test:
    name: Visual Regression Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0 # fetches all branches
      - name: Maybe snapshot
        run: |
          CHANGED_PC_FILES=$(git diff --name-only origin/${{ github.base_ref }} origin/${{ github.head_ref }} -- "./**/*.pc")
          if [ -n "$CHANGED_PC_FILES" ]; then
            yarn add percy percy-paperclip
            percy exec -- percy-paperclip
          fi
        working-directory: ./path/to/frontend
        env: 
          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
```

> Be sure to change `working-directory` to point to where your `paperclip.config.json` file is. 

☝🏻 This script will run only when PC files change, so if you're working with people working on the back-end, for instance, they won't get this check (since we're assuming they won't touch PC files). 

To go along with the script above, you'll need to set up a [baseline](https://docs.percy.io/docs/baseline-picking-logic) for your master branch. Here's a script for that:

```yml
name: Master Checks
on:
  push:
    branches:
      - master
    
jobs:
  visual-regression-test:
    name: Visual Regression Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - name: Maybe snapshot
        run: |
          CHANGED_PC_FILES=$(git diff --name-only origin/master^ origin/master -- "./**/*.pc")
          if [ -n "$CHANGED_PC_FILES" ]; then
            yarn add percy
            yarn snapshot
          fi
        working-directory: ./path/to/frontend
        env: 
          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
          
```

> Again, be sure to change `working-directory` to point to where your `paperclip.config.json` file is. 

☝🏻 This script runs whenever a `*.pc` file changes on master, and ensures that subsequent PRs are visually testing against the correct baseline.


