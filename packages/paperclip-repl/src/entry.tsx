import { App } from "./app";

new App({
  files: {
    "entry.pc": `
      Hello World
    `
  },
  entry: `entry.pc`
}).init();
