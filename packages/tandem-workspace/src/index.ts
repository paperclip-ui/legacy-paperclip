import { start } from "./server";

start({
  cwd: process.cwd(),
  http: {
    port: Number(process.env.PORT || 3004),
  },
});
