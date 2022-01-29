

```javascript
const client = new EditorClient(new SockJSAdapter(window.location));

const doc = await client.openDocument("hello.pc"); // Hello world!@

// display the element to the screen
document.body.appendChild(div.preview);

const node = doc.getNodeByPath([0]);


// should update the previw and such
doc.updateText(node, "Hello world");


```


### TODO

- [ ] patch AST with CRDT changes
  - [ ] parse_until option for AST

### Considerations

- Some way to connect the client with a preview without going through state
- CRDT text documents, need to start with this
