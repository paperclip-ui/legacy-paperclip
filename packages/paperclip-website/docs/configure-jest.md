---
id: configure-jest
title: Configure Paperclip with Jest
sidebar_label: Jest
---

You can include Paperclip UIs directly in your Jest tests. 

## Installation

```sh
npm install paperclip-jest --save-dev
```

## package.json Config

After installing the `paperclip-jest` module, You'll need to update the `jest.transform` property like so:

```json
"jest": {
  "transform": {
    "^.+\\.pc$": "paperclip-jest"
  }
}
```

After that, you should be able to import `*.pc` files in Jest tests. 