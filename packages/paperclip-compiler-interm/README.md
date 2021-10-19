Intermittent compiler step.

```javascript
import { IntermediateCompiler } from "paperclip-compiler-interm";
import { translateReact } from "paperclip-compiler-react";

const interm = new IntermediateCompiler(engine);
const output = translateReact(interm);
```


TODOs:

  - [ ] source maps