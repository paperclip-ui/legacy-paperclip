

```javascript
import { build } from "@paperclipui/builder";

const config: PaperclipConfig = {
  compiler: {
    name: "@paperclipui/compiler-react"
    css: {
      output: "embed" | "module" | "mono",
      include: true
    }    
  }
}

build(config, {
  cwd: process.cwd(),
  watch: false
})
.onFile(file => {
  // do something
})
.onEnd(() => {
  // called when there is no watch
});

```


Qs:

- @paperclipui/loader
  - can pass in config 