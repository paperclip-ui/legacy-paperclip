import { start } from "./server";

start({
  http: {
    port: Number(process.env.PORT || 3004)
  }
});
