

```javascript
import { EngineDelegate } from "paperclip-core";
import { PaperclipEditorHost, PaperclipClient } from "paperclip-editor-engine";

const host = new PaperclpEditorHost(new EngineDelegate());

// CRDT connection
const { textDocument, vobjDocument } = await host.open("file.pc");

textDocument.insertText({ });


vobjDocument.insertNodeBefore({ id: "virtual-node-id", child: { kind: "text", value: "Hello world" } })


host.onConnection(client => {
  client.onMessage(message => {

  });
});


// somewhere far far away...

const client = new PaperclipClient(host.url);


client.loadDirectory();


// open a new document, or as many as we want
const { textDocument, vobjDocument } = await client.open("path/to/paperclip/file.pc");



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
- CRDT text documents, need to start with this


Needs to support:

```

      .listen(this._loadNodeSources);
    channels.helloChannel(adapter).listen(this._initialize);
    channels.loadDirectoryChannel(adapter).listen(this._loadDirectory);
    channels.inspectNodeStyleChannel(adapter).listen(this._inspectNode);
    channels.revealNodeSourceChannel(adapter).listen(this._revealSource);
    channels
      .revealNodeSourceByIdChannel(adapter)
      .listen(this._revealSourceById);
    channels.popoutWindowChannel(adapter).listen(this._popoutWindow);
    channels.openFileChannel(adapter).listen(this._openFile);
    channels.editCodeChannel(adapter).listen(this._editCode);
    channels.commitChangesChannel(adapter).listen(this._commitChanges);
    channels.setBranchChannel(adapter).listen(this._setBranch);
    channels.editPCSourceChannel(adapter).listen(this._editPCSource);
```