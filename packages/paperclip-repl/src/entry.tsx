import { App } from "./app";

new App(
  {
    files: {
      "entry.pc": `
      Hello World
    `,
      "module.pc": `
      Something
    `
    },
    entry: `entry.pc`
  },
  document.getElementById("app")
).init();
