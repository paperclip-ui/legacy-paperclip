```javascript
import { EngineDelegate } from "paperclip-core";
import { PaperclipEditorHost, PaperclipClient } from "paperclip-editor-engine";

const host = new PaperclpEditorHost(new EngineDelegate());

host.onConnection(client => {
  client.onMessage(message => {

  });
});


// somewhere far far away...

const client = new PaperclipClient(host.url);


// open a new document, or as many as we want
const document = await client.open("path/to/paperclip/file.pc");

// state may not 
await document.preview.getState();


document.preview.onChange(async () => {
  
  dispatch(documentStateChanged(await document.preview.getState()));
});

document.onChange(event => {
  document.previe
});

```


### Considerations

- Some way to connect the client with a preview without going through state