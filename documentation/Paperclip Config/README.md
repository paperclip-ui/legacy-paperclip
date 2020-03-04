The Paperclip Config (`pcconfig.json`) contains configuration information for the compile & runtime. Here's a breakdown of the options you can use:

```javascript
{

  // Options for the specific compiler
  "compilerOptions": {

    // module name of the compiler to use
    "name": "paperclip-react-compiler"
  },

  // Module directories where import statements resolve from.
  "moduleDirectories": ["./src"],

  // File pattern for all of your Paperclip files.
  "filesGlob": "./src/**/*.pc"
}
```

> ⚠️ Note that `pcconfig.json` files are JSON, so comments should be omitted.