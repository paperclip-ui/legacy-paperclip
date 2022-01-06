Interimittent compiler step.

```javascript
import { InterimCompiler } from "@paperclipui/interim";
import { translateReact } from "@paperclipui/compiler-react";

const interm = new InterimCompiler(engine);
const output = translateReact(interm);
```


TODOs:

  - [ ] source maps