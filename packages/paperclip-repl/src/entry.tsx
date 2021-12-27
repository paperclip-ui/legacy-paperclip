import { App } from "./app";
import dedent from "dedent";

new App(
  {
    files: {
      "file:///entry.pc": dedent`
      <import src="./module.pc" as="module" />

      <module.Test>
        Something
      </module.Test>
    `,
      "file:///module.pc": dedent`
      <div export component as="Test">
        <style>
          color: red;
          font-family: sans-serif;
        </style>
        {children}
      </div>
    `
    },
    entry: `file:///entry.pc`
  },
  document.getElementById("app")
).init();
