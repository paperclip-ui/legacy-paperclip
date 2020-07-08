Demo:
```typescript
import { getSuggestions } from "paperclip-intellisense";

let source = `<style> .element { col`;

const suggestions = getSuggestions(source, {
  mixins: [["typography", "big-font"]],
  components: [["internal-component"]],
  classNames: [["typography", "my-imported-class"]]
}); // [{ sub: 3, value: "color" }]


const suggestion = suggestions[0];

source = source.substr(0, source.length - suggestion.length) + suggestion.value;
```

