Intermittent compiler step.

```javascript
import { translateIntermediate } from "paperclip-compiler-interm";
import { translateReact } from "paperclip-compiler-react";

const interm = translateIntermediate(`<div export component as="Component" />`);
const output = translateReact(interm);
```
