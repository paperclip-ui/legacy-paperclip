```typescript
const writer = new PCSourceWriter(engine);
writer.handleEvent({
  kind: "ANNOTATIONS_CHANGED"
});
writer.onContentChanged(function(uri, content) {
  vscode.updateContent(uri, content);
});
```