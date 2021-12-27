import { App } from "./app";

new App(
  {
    files: {
      "file:///entry.pc": `
      Hello World
    `,
      "file:///module.pc": `
      Something
    `
    },
    entry: `file:///entry.pc`
  },
  document.getElementById("app")
).init();
