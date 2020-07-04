
Paperclip is a language for building UI primitives. Here's an Example:

```html

<!-- Styles are scoped to this document, so you don't have to worry about them leaking out  -->
<style> 
  .button {
    font-family: Helvetica;
    display: inline-block;
    border-radius: 10px;
    padding: 10px 20px;
    color: #FFF;
    background: rgb(51, 51, 51);
    &.secondary {
      color: #333;
      border: 1px solid #333;
      background: transparent;
    }
  }
</style>

<!-- This component is compiled to code -->
<div export component as="Button" class:secondary class="button">
  {children}
</div>

<Button>
  This is a primary button
</Button>

<Button secondary>
  This is a secondary button
</Button>
```

☝🏻 Not much else to this. Here's how you use it in React (using Webpack or CLI tool):

```typescript
import {Button} from "./button.pc";

export SomeForm = () => {
  return <>
    <Button>
      This is a primary button
    </Button>
    <Button secondary>
      This is a secondary button
    </Button>
  </>;
};
```

> ☝🏻 Currently React is the only compiler target, but more are planned. 

## Why use Paperclip?

### Compiles to plain code

No interpreters or runtimes. Paperclip UIs compile directly to your target framework (currently only React for Alpha, more targets planned later). 

### Scoped styling

Styles in Paperclip are scoped to the documents they're defined in, so you don't have to worry about style collisions. 

### Faster development

Paperclip comes with a [realtime preview for VS Code](https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode-extension) that allows you to build UIs in a flash.  ⚡️

<!-- ![VSCode Demo](https://user-images.githubusercontent.com/757408/75412579-f0965200-58f0-11ea-8043-76a0b0ec1a08.gif) -->

![VSCode Demo](./assets/button-demo.gif)


### Visual regression testing

Paperclip encourages you to define previews of _every_ visual state of your UI. Because of that, you automatically get visual regression testing - no setup required. Just run `percy-paperclip` in your project directory.


![Percy snapshots](./assets/snapshot.gif)


### Perfect for design systems

Paperclip makes it easy to set up & document design systems that are discoverable, and re-usable. 

![Percy snapshots](./assets/design-system.gif)


### Strongly typed

Paperclip's CLI tool generates TypeScript definition files so that you can safely include Paperclip UIs in your project. Here's an example:

```typescript
/* eslint-disable */
import {ReactNode, ReactElement} from "react";

type Factory<TProps> = (props: TProps) => ReactElement;

export declare const classNames: {
  "app": string,
  "app-container": string,
  "todoapp": string,
  "new-todo": string,
  "toggle-all": string,
  "info": string,
  "todo-list": string,
  "main": string,
};

type Props = {
  onNewTodoKeyPress: Function,
  items: ReactNode,
  controls: ReactNode,
};

declare const View: Factory<Props>;
export default View;
```

### Roadmap

Here's a peak at what's planned for Paperclip:

- Multiple compiler targets so that you can re-use your Paperclip UIs in different languages & frameworks
- Extension for Atom, Sublime, and other editors
- Remote UI preview that you can use across devises & browsers (such as BrowserStack).
- Storybook integration
- Zeplin design token sync, so that you can keep your designs in sync with Figma & Sketch
- UI editor controls:
  - CSS animation editor
  - various editors for colors, box shadows, filters, etc
- A11Y
- Code splitting so that you don't need to include all of your CSS into one bundle

## Resources

- [VS Code extension](https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode-extension)
- [Getting started](./documentation/Getting%20Started)
- [Syntax](./documentation/Syntax)
- Integrations
  - [React](./packages/paperclip-compiler-react)
  - [Webpack](./packages/paperclip-loader)
- Examples
  - [React TodoMVC](./examples/react-todomvc)
