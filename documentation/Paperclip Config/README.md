The Paperclip Config (`paperclip.config.json`) contains configuration information for the compilers & runtime. Here's a breakdown of the options you can use:

```javascript
{

  // Options for the specific compiler
  "compilerOptions": {

    // module name of the compiler to use
    "name": "paperclip-compiler-react"
  },

  // Where your source paperclip files live
  "soureDirectory": "./src",
}
```

> ⚠️ Note that `paperclip.config.json` files are JSON, so comments should be omitted.