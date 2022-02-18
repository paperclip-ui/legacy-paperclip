![Checks](https://github.com/paperclipui/paperclip/workflows/Checks/badge.svg?branch=master)

<br />

<div style="text-align: left; margin-bottom: 32px;">
  <img src="assets/logo-outline-5-beta.png" width="420">
</div>

<br />

Paperclip is a DSL for UI builders. Here's what a UI file looks like:

```html
<!--
  @frame { height: 768, visible: false, width: 1024, x: -176, y: 173 }
-->
<ul component as="List">
  <style>
    padding: 14px;
    margin: 0px;
    font-family: sans-serif;
    display: flex;
    flex-direction: column;
    gap: 8px;
    list-style-type: none;
  </style>
  {children}
</ul>

<!--
  @frame { height: 768, visible: false, width: 1024, x: -1, y: 0 }
-->
<li component as="ListItem">
  {children}
</li>

<!--
  @frame { height: 366, title: "Todos", width: 258, x: 766, y: 402 }
-->
<List>
  <ListItem>buy cereal</ListItem>
  <ListItem>buy milk</ListItem>
</List>
```

Here's a demo of a UI builder prototype that works with Paperclip:

![alt something](./preview.gif)

Paperclip UIs cover just **HTML, CSS, and primitive components**. Developers can import these primitive components into their codebase like so:

```jsx
import * as styles from "./styles.pc";

export const List = ({items}) => {
  return <styles.List>
    {items.map(item) => {
      return <styles.ListItem key={item.id}>{item.label}</styles.ListItem>;
    }}
  </styles.List>;
};
```

## Goal

The goal for Paperclip is to enable non-developers to build logic-less UIs for any kind of web application using. Some example use cases include:

- Give designers complete control over HTML and CSS development with Webflow-like tooling.
- Enabling PMs and anyone else to create variant UIs / text / styles for a/b testing.
- Enable anyone to spot-edit visual bugs that are in production.

## Why code as a data model?

Mostly for readability, which is important because:

- A readable UI file can be easily reviewed for any structural problems.
- A readable UI file makes merge conflicts easy to resolve.
- Sometimes it's easier to write functionality by hand.


## Why not use an existing language?

Mostly to have total control over the data model, and to only have features specifically for visual development. Most languages contain features that make it difficult to effectively map to a _practical_ UI builder. I think for a UI builder to be flexible and simple, that simplicity needs to be reflected in the data model. 

## What's the status of this Project?

Paperclip has been in active development for a few years, and most of the basic functionality is in. The next phase for Paperclip is the UI builder which will continue to help shape the DSL. 


## Can I use Paperclip now?

Yes! Paperclip has been in active development for a few years now, and can be used to build React applications.

## Installation

Just run this command in your existing project to get started

```
npx @paperclip-ui/cli init
```

This will walk you through a brief setup process. Next, just run:

```
npx @paperclip-ui/cli build
```

## Resources

- Community
  - [Discord](https://chat.paperclip.dev)
- API
  - [Syntax](https://paperclip.dev/docs/usage-syntax) - How to write Paperclip documents
  - [React usage](https://paperclip.dev/docs/usage-react) - Using Paperclip UIs in your React code
  - [Configuration](https://paperclip.dev/docs/configure-paperclip) - How to configure Paperclip for your codebase
- Examples
  - [Syntax / basic](./examples/syntax-basic)
  - [React / basic](./examples/react-basic)
  - [Tailwind](./examples/React-basic)
- Tools
  - [CLI usage](https://paperclip.dev/docs/usage-cli)
  - [Designer](https://paperclip.dev/docs/visual-tooling)
  - [Visual regression tools](https://paperclip.dev/docs/visual-regression-tooling)
  - [VS Code extension](https://paperclip.dev/docs/guide-vscode)
- Integrations
  - [Webpack](https://paperclip.dev/docs/getting-started-webpack) - Setting up with Webpack
  - [Percy](https://paperclip.dev/docs/configure-percy)
  - [Jest](https://paperclip.dev/docs/configure-jest)
  - [Prettier](https://paperclip.dev/docs/configure-prettier)
- Guides
  - [Creating a compiler](https://paperclip.dev/docs/guide-compilers/)
  - [Using third-party CSS](https://paperclip.dev/docs/guide-third-party-libraries)


## Contributing

Most of the focus right now for Paperclip is around the UI builder, so if you would like to help out, feel free to reach out! Some other areas in the future will include:

- More compilers: Java, Ruby, Python, PHP.
- Migration tooling to help people translate their existing HTML & CSS into Paperclip UIs
- Get VS Code extension to work with github.dev, making it easier for people to edit UI files online.
- Help with language featuers that are mappable to UI tooling.
- Performance adjustments around Rust rendering engine.
- More tooling that enables Paperclip to be edited or visualized in other mediums (not just UI builders).
  - e.g: ability to edit any UI directly in staging
- More _safety_ features that give non-engineers confidence about shipping UIs.
  - visual regression coverage
  - More robust inferencing engine
  - 