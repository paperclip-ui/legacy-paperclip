![Checks](https://github.com/paperclipui/paperclip/workflows/Checks/badge.svg?branch=master)

<br />

<div style="text-align: left; margin-bottom: 32px;">
  <img src="assets/logo-outline-5-beta.png" width="420">
</div>

<br />

Paperclip is a DSL for UI builders. Here's what a basic UI file looks like:

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

### Features

Paperclip is limited to the pieces of functionality that are _necessary_ for building just about any kind of presentational component. They are:

- Primitive components
- Style variants
- Slots (being able to insert children in certain areas of a component)
- Attribute bindings

### Goal

The goal for Paperclip is to be a _scalable_ data format for UI builders that can be used to create any kind of web application, and safe enough for non-engineers to feel confident about making any visual change.

In a perfect world, Paperclip could be the engine for a UI builder that enables: 

- Designers to have complete control over HTML and CSS development with [Webflow](https://webflow.com)-like tooling.
- PMs and anyone else to create variant UIs / text / styles for a/b testing. 
- Enable anyone on a team to spot-edit visual bugs that are in production (wouldn't it be great to right-click any staging / production element and edit it on the spot??). 

<!--In other words, Paperclip aims to help give development control over HTML & CSS (partially or fully) to anyone on the team (I'd imagine mostly designers). -->

### Why code as a data model?

Mostly for maintainability, and collaboration.

- A readable UI file can be easily reviewed for any structural problems.
- A readable UI file makes merge conflicts easy to resolve.
- Sometimes it's easier to write functionality by hand.
- Easier escape hatch for engineers that are worried about vendor lock-in.
- Easier to reason about when wiring up with logic. 

### Why not use an existing language?

Mostly to have total control over the data model, and to only have features specifically for visual development. Most languages contain features that make it difficult to effectively map to a _practical_ UI builder (even vanilla HTML and CSS to an extent). I think for a UI builder to be flexible and simple, that simplicity (to a degree) needs to be reflected in the data model. 

Another reason why Paperclip was created was to ensure that _multiple_ languages could be targeted. Eventually the plan is for Paperclip to compile down to just about any web language.

### What's the status of this Project?

Paperclip has been in active development for a few years, and most of the basic functionality is in. It's an inflection point how however where a UI builder is necessary for the continued evolution of the DSL. 

### Can I use Paperclip now?

Yes! Paperclip is stable and  has been in active development for a few years now, and can be used to build React applications. Currently it's powering most of the front-end at [Hum Capital](https://humcapital.com/).

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