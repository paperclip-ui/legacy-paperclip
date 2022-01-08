

```javascript
import { build } from "@paperclip-ui/builder";

const config: PaperclipConfig = {
  compiler: {
    name: "@paperclip-ui/compiler-react"
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

- paperclip-loader
  - can pass in config 