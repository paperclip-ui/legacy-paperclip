---
id: guide-compilers
title: Compilers
sidebar_label: Compilers
---

>  If you prefer to figure things out yourself, a few good place to start would be the [React compiler](https://github.com/paperclipui/paperclip/blob/master/packages/paperclip-compiler-react/src/code-compiler.ts), and [Interim module](https://github.com/paperclipui/paperclip/blob/master/packages/paperclip-interim/src/state/html.ts).

This is a very basic guide to getting started with compilers.

Compilers should be written in JavaScript (this will be expanded in the future). Here's the general structure of one:

```
@paperclip-ui/compiler-[NAME]/
  src/
    compile.ts
    index.ts
  package.json
```

We'll look at the main entry point into the compiler: `index.ts`.

```tsx
import { InterimModule, CompileOptions } from "@paperclip-ui/interim";
import { compile as compile2Code } from "./code-compiler";

/**
 * Takes the Paperclip AST and returns compiled code
 */

export const compile = ({module}: CompileOptions) => {
  const code  = compile2Code(module);

  return {
    ".my-extension": code,
    // you can add more translations here. 
    // .rb.
  };
};
```

The `module` passed into the `compile` function is the JSON representation of the Paperclip file being compiled. For example, if we look at this:

```html
<div export component as="HelloWorld">
  <style>
    color: red;
  </style>
  Hello world!
</div>
```

The [InterimModule](https://github.com/paperclipui/paperclip/blob/master/packages/@paperclip-ui/interim/src/state/module.ts) representation of this would be something like:

```javascript
{
  imports: [],
  components: [
    {
      as: "HelloWorld",
      kind: "Component",
      exported: true,
      isInstance: false,
      attributes: {},

      // class names to attach to this element. These are
      // associated with the inline styles & other CSS defined
      // within the document.
      scopeClassNames: ["_59bb", "_pub-59bb"],

      children: [
        {
          kind: "Text",
          value: "Hello world!",
        }
      ]
    }
  ]
}
```

Using the information defined in _just this module_, we can create a simple (although incomplete) compiler:

```javascript
import {
  InterimNodeKind,
  InterimModule,
  InterimComponent,
  InterimText,
  Interim
} from "@paperclip-ui/interim";

export const compile = (
  module: InterimModule
) => {
  return `
    ${compileComponents(module)}
  `;
}

const compileComponents = (module: InterimModule) => (
  module.components.map(compileComponent).join("\n");
);

const compileComponent = (component: InterimComponent) => {
  const buffer = [];

  buffer.push(
    `const ${component.as} = (props) => {
      return ${compileNode(component)}
    }`
  );


  // make component accessible to external modules, otherwise
  // it's for internal-use only
  if (component.exported) {
    buffer.push(`export {${component.as}}`);
  }

  return buffer.join("");
};

const compileNode = (node: InterimNode) => {
  switch(node.kind) {
    case InterimNodeKind.Element:
    case InterimNodeKind.Component: {
      return compileElement(node);
    }
    case InterimNodeKind.Text: {
      return compileText(node);
    }
  }
};

const compileText = (text: Text) => text.value;

const compileElement = (element: InterimElement | InterimComponent) => {
  return `
    <${element.tagName}${compileAttributes(element)}>
      ${compileChildren(element)}
    </${element.tagName}>
  `;
};  

const compileChildren = (element: InterimElement | InterimComponent) => {
  return element.children.map(compileNode).join("");
};  

const compileAttributes = (element: InterimElement | InterimComponent) => {
  const buffer = [

    // You'll also want to include classes defined in
    // element.attributes.class as well
    ` class="${element.scopeClassNames.join(" ")}"`
  ];

  // for (const name in element.attributes) {
  // .. compile attribute here...
  // }

  return buffer.join("");
};
```

Compilers should should render HTML. No need to worry about CSS, that's compiled for you. 

After you're done, update your `paperclip.config.json` file to point to your compiler:

```javascript
{
  compilerOptions: {
    target: "./path/to/my-compiler"
  }
}
```

Finally, just run:

```
npx @paperclip-ui/cli build
```

And you should have compiled code!

That's it for compiler basics. If you're interested in contributing to the development of Paperclip compilers, feel free to reach out! 
