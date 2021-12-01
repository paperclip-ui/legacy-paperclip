Interimittent compiler step.

```javascript
import { InterimCompiler } from "paperclip-interim";
import { translateReact } from "paperclip-compiler-react";

const interm = new InterimCompiler(engine);
const output = translateReact(interm);
```


TODOs:

  - [ ] source maps