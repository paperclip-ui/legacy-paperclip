Interimittent compiler step.

```javascript
import { InterimCompiler } from "@paperclip-ui/interim";
import { translateReact } from "@paperclip-ui/compiler-react";

const interm = new InterimCompiler(engine);
const output = translateReact(interm);
```


TODOs:

  - [ ] source maps