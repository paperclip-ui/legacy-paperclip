Interimittent compiler step.

```javascript
import { interimCompiler } from "paperclip-compiler-interim";
import { translateReact } from "paperclip-compiler-react";

const interm = new interimCompiler(engine);
const output = translateReact(interm);
```


TODOs:

  - [ ] source maps