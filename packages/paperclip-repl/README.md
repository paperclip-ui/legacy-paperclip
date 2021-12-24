```javascript
import React from "react";
import {PaperclipREPL} from "paperclip-repl";

const FILES = {
  "entry.pc": `
    Hello World
  `
};

const onContentChange = (fileName: string, content: string) => {
  // do something
};

<PaperclipREPL 
  files={FILES} 
  main="entry.pc" 
  onContentChange={onContentChange}
/>

```