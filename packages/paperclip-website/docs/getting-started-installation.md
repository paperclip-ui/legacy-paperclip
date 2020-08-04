---
id: getting-started-installation
title: Installation
sidebar_label: Installation 
---

Paperclip's installation is the same for **new** and **existing** projects. If you're using Paperclip for the first time, I'd recommend starting with a new project _first_ so that you can get a good feel for the tool. It's super quick to set up.

### Existing projects

To install Paperclip in an existing project, `cd` into your project directory, then run:

```bash
npx paperclip init
```

This will install all of the necessary dependencies for Paperclip. After that, you'll need to **manually
configure your project**. The next page will help you do that. 

### New projects

For new projects, just run:

```sh
mkdir my-new-project && cd my-new-project && npx paperclip init
```

You'll be asked some questions, then a new project will be generated for you. After that, just run:

```
npm start
```

Since you'll have a project that's already configured, you can skip the next page, and jump straight into
[Using With React](getting-started-first-ui.md).