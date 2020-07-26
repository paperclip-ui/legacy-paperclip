(window.webpackJsonp = window.webpackJsonp || []).push([
  [46],
  {
    192: function(e, n, t) {
      "use strict";
      t.r(n),
        t.d(n, "frontMatter", function() {
          return r;
        }),
        t.d(n, "metadata", function() {
          return s;
        }),
        t.d(n, "rightToc", function() {
          return c;
        }),
        t.d(n, "default", function() {
          return p;
        });
      var a = t(2),
        o = t(9),
        l = (t(0), t(204)),
        r = {
          id: "usage-syntax",
          title: "Paperclip Syntax",
          sidebar_label: "Syntax"
        },
        s = {
          id: "usage-syntax",
          isDocsHomePage: !1,
          title: "Paperclip Syntax",
          description: "Basics",
          source: "@site/docs/usage-syntax.md",
          permalink: "/docs/usage-syntax",
          editUrl:
            "https://github.com/crcn/paperclip/packages/edit/master/website/docs/usage-syntax.md",
          sidebar_label: "Syntax",
          sidebar: "docs",
          previous: {
            title: "Installing the VS Code extension",
            permalink: "/docs/getting-started-vscode"
          },
          next: {
            title: "Using Paperclip in React apps",
            permalink: "/docs/usage-react"
          }
        },
        c = [
          { value: "Basics", id: "basics", children: [] },
          {
            value: "Styling",
            id: "styling",
            children: [
              { value: "Nested rules", id: "nested-rules", children: [] },
              { value: "@mixin", id: "mixin", children: [] },
              { value: "@export", id: "export", children: [] },
              {
                value: "&gt;&gt;&gt;class-reference",
                id: "class-reference",
                children: []
              },
              { value: ":global", id: "global", children: [] },
              {
                value: "Other global styles",
                id: "other-global-styles",
                children: []
              }
            ]
          },
          { value: "Import", id: "import", children: [] },
          {
            value: "Components",
            id: "components",
            children: [
              {
                value: "Component previews",
                id: "component-previews",
                children: []
              },
              {
                value: "Exporting components",
                id: "exporting-components",
                children: []
              },
              {
                value: "Overriding component styles",
                id: "overriding-component-styles",
                children: []
              }
            ]
          },
          {
            value: "Bindings",
            id: "bindings",
            children: [
              { value: "Child bindings", id: "child-bindings", children: [] },
              {
                value: "Attribute bindings",
                id: "attribute-bindings",
                children: []
              },
              {
                value: "Optional bindings",
                id: "optional-bindings",
                children: []
              },
              { value: "Variant styles", id: "variant-styles", children: [] }
            ]
          },
          { value: "Fragments", id: "fragments", children: [] }
        ],
        i = { rightToc: c };
      function p(e) {
        var n = e.components,
          t = Object(o.a)(e, ["components"]);
        return Object(l.b)(
          "wrapper",
          Object(a.a)({}, i, t, { components: n, mdxType: "MDXLayout" }),
          Object(l.b)("h3", { id: "basics" }, "Basics"),
          Object(l.b)(
            "p",
            null,
            "You can start writing HTML and CSS as soon as you open up a Paperclip document. Here's an example:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              "<style>\n  div {\n    color: purple;\n    font-size: 32px;\n    font-family: papyrus;\n  }\n</style>\n<div>I'm purple!</div>\n"
            )
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Styles are scoped"),
            ", meaning that they won't leak into other documents (you can still override styles using the class reference syntax), so you're welcome to define style selectors however you want. No special naming conventions needed."
          ),
          Object(l.b)("h2", { id: "styling" }, "Styling"),
          Object(l.b)(
            "p",
            null,
            "Styles in Paperclip have a bit more behavior than regular CSS."
          ),
          Object(l.b)("h3", { id: "nested-rules" }, "Nested rules"),
          Object(l.b)(
            "p",
            null,
            "Nested rules eliminates some redundancy around defining style selectors."
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Syntax"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)({ parentName: "pre" }, { className: "language-css" }),
              ".parent-rule {\n\n  /* equivalent to: .parent-rule .child-rule */\n  .child-rule {\n\n  }\n  /* equivalent to: .parent-rule--variant */\n  &--variant-rule {\n\n  }\n}\n"
            )
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Example"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '// file: nested-style-demo.pc\n<style>\n  .container {\n    .header {\n      font-size: 32px;\n      font-weight: 600;\n      color: red;\n    }\n    .content {\n      font-size: 18px;\n      color: blue;\n    }\n  }\n</style>\n\n<div className="container">\n  <div className="header">\n    Header\n  </div>\n  <div className="content">\n    content\n  </div>\n</div>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("inlineCode", { parentName: "p" }, "&"),
            " can be used to combine the ",
            Object(l.b)("em", { parentName: "p" }, "parent"),
            " selector in nested rules like so:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '// file: nested-combine-demo.pc\n<style>\n  .button {\n    font-family: Noteworthy;\n    background: grey;\n    display: inline-block;\n    border: 2px solid grey;\n    border-radius: 2px;\n    padding: 2px 10px;\n    &--secondary {\n      color: grey;\n      background: transparent;\n    }\n    &.preview {\n      margin: 10px;\n    }\n  }\n</style>\n\n<div className="button preview">\n  Button primary\n</div>\n<div className="button button--secondary preview">\n  Button secondary\n</div>\n'
            )
          ),
          Object(l.b)("h3", { id: "mixin" }, "@mixin"),
          Object(l.b)(
            "p",
            null,
            "Style mixins are useful for defining a bundle of style declarations (like ",
            Object(l.b)("inlineCode", { parentName: "p" }, "color"),
            ", ",
            Object(l.b)("inlineCode", { parentName: "p" }, "font-size"),
            ") that you then can include into style rules."
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Syntax"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)({ parentName: "pre" }, { className: "language-css" }),
              "@mixin mixin-name {\n  /* style props */\n  decl-name: decl-value;\n}\n"
            )
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)(
              "strong",
              { parentName: "p" },
              "Including mixins syntax"
            ),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)({ parentName: "pre" }, { className: "language-css" }),
              ".my-style {\n  @include mixin-name another-mixin and-another-mixin;\n}\n"
            )
          ),
          Object(l.b)(
            "p",
            null,
            " ",
            Object(l.b)("strong", { parentName: "p" }, "Example"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '// file: mixin-demo.pc\n<style>\n  :root {\n    --font-family-default: Quotes Script;\n    --color-grey-100: #333;\n    --color-green-100: #0C0;\n  }\n  \n  @mixin color-text-green {\n    color: var(--color-green-100);\n  }\n  \n  @mixin default-text {\n    font-family: var(--font-family-default);\n    color: var(--color-grey-100);\n    font-size: 32px;\n  }\n  \n  .message {\n\n    /* @include includes style mixins; you can have any number of them separated by spaces. */\n    @include default-text color-text-green;\n    text-decoration: underline;\n  }\n</style>\n\n<div className="message">\n  What has to be broken before you can use it?\n</div>\n'
            )
          ),
          Object(l.b)("h3", { id: "export" }, "@export"),
          Object(l.b)(
            "p",
            null,
            "The ",
            Object(l.b)("inlineCode", { parentName: "p" }, "@export"),
            " rule allows you to export styles to other documents, as well as application code."
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Syntax"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)({ parentName: "pre" }, { className: "language-css" }),
              "@export {\n  .my-style {\n    /* styles here */\n  }\n\n  @keyframes my-keyframe {\n    /* keyframe code here */\n  }\n\n  @mixin my-mixin {\n    /* styles here */\n  }\n}\n"
            )
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Example"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '\nYou\'re also welcome to reference styles from other documents, specifically `class names`, `mixins`, and `keyframes`. For example:\n\n```html live\n// file: main.pc\n<import src="./styles.pc" as="styles">\n\n<style>\n  .header-text {\n    @include styles.big-text;\n    animation: styles.pulse 1s infinite;\n  }\n</style>\n\n\x3c!-- >>> is a class reference - docs below --\x3e\n<div className="header-text >>>styles.default-text">\n  Hello again!\n</div>\n\n// file: styles.pc\n\n<style>\n\n  /* Exported mixins */\n\n  /* @export docs below */\n  @export {\n    @mixin text-color-green-default {\n      color: green;\n    }\n    @mixin big-text {\n      font-size: 32px;\n    }\n  }\n\n  /* Exported classes */\n\n  @export {\n    .default-text {\n      font-family: Herculanum;\n      letter-spacing: 0.05em;\n    }\n  }\n\n  /* Exported animations */\n\n  @export {\n    @keyframes pulse {\n      0% {\n        opacity: 1;\n      }\n      50% {\n        opacity: 0.5;\n      }\n      100% {\n        opacity: 1;\n      }\n    }\n  }\n</style>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "Note that you ",
            Object(l.b)("em", { parentName: "p" }, "must"),
            " wrap styles around ",
            Object(l.b)("inlineCode", { parentName: "p" }, "@export"),
            " if you want to reference them. "
          ),
          Object(l.b)(
            "blockquote",
            null,
            Object(l.b)(
              "p",
              { parentName: "blockquote" },
              "On that note, I'd recommend only exporting things that you need in other documents since export keywords (",
              Object(l.b)("inlineCode", { parentName: "p" }, "@export"),
              ", ",
              Object(l.b)("inlineCode", { parentName: "p" }, "export"),
              ") make it clear around what's public & private. "
            )
          ),
          Object(l.b)(
            "p",
            null,
            "You can reference class names in React code like so:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)({ parentName: "pre" }, { className: "language-jsx" }),
              'import * as cx from "classnames";\nimport * as typography from "./typography.pc";\n<div className={cx(\n  typography.classNames["default-text"]\n)}>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "Note that ",
            Object(l.b)("inlineCode", { parentName: "p" }, ".header-text"),
            " is not exported, so it's not available in our app code."
          ),
          Object(l.b)("h3", { id: "class-reference" }, ">>>class-reference"),
          Object(l.b)(
            "p",
            null,
            "Paperclip allows you to explicitly reference class selectors, which is helpful if you're looking to reference or overrides styles in other documents. "
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Syntax"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '\n<div className=">>>class-name" />\n\n<div className=">>>imported-doc.class-name" />\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Example"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '// file: main.pc\n<import src="./atoms.pc" as="atoms">\n\n<span className=">>>atoms.font-default">\n  Hello\n</span>\n// file: atoms.pc\n\n<style>\n  @export {\n    .font-default {\n      font-family: Helvetica;\n      color: blue;\n      font-size: 32px;\n      letter-spacing: 0.05em;\n    }\n  }\n</style>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "You can also use class references to ",
            Object(l.b)(
              "a",
              Object(a.a)(
                { parentName: "p" },
                { href: "#overriding-component-styles" }
              ),
              "override component styles"
            ),
            "."
          ),
          Object(l.b)("h3", { id: "global" }, ":global"),
          Object(l.b)(
            "p",
            null,
            "All style rules are, by default, scoped to the document they're defined in. This ensures that they don't leak & have unintended side-effects. However, there ",
            Object(l.b)("em", { parentName: "p" }, "are"),
            " rare cases when you may need to define a global style rule, such as styling HTML defined outside of Paperclip that doesn't have a way to define a ",
            Object(l.b)("inlineCode", { parentName: "p" }, "class"),
            " attribute. "
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Syntax"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)({ parentName: "pre" }, { className: "language-css" }),
              ":global(.my-selector-here > div ~ .another-selector) {\n  name: value;\n}\n"
            )
          ),
          Object(l.b)(
            "p",
            null,
            "Here's an example that stylizes parts of ",
            Object(l.b)(
              "a",
              Object(a.a)(
                { parentName: "p" },
                { href: "https://github.com/JedWatson/react-select" }
              ),
              "react-select"
            ),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<style>\n\n  .wrapper {\n    \n    /* global for now so that we get tests to pass */\n    :global(.select__) {\n      &control {\n        display: flex;\n        background: var(--color-background);\n\n        /* more declarations here */\n\n        &--is-focused {\n          /* more declarations here */\n        }\n\n        &:hover {\n          /* more declarations here */\n        }\n      }\n      &value-container,\n      &single-value,\n      &multi-value__label,\n      &input {\n        /* more declarations here */\n      }\n\n      /* selectors here */\n    }\n  }\n</style>\n\n<div export component as="Wrapper" className="wrapper">\n  {children}\n</div>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "Here's how you use the above styles in React code:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)({ parentName: "pre" }, { className: "language-jsx" }),
              "import * as ui from './Select.pc';\n\n// Keep the select styles locked in\n<ui.Wrapper>\n  <DynamicSelect classNamePrefix=\"select\" {...props} />\n</ui.Wrapper>\n\n"
            )
          ),
          Object(l.b)(
            "h3",
            { id: "other-global-styles" },
            "Other global styles"
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("inlineCode", { parentName: "p" }, ":root"),
            " and ",
            Object(l.b)("inlineCode", { parentName: "p" }, ":global"),
            " CSS properties are applied globally when imported. Here's an example:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '// file: demo.pc\n<import src="./styles.pc">\n<style>\n  .message {\n    color: var(--color-red-default);\n  }\n</style>\n<div className="message">\n  A male barber shaves all and only those men who do not shave themselves. Does he shave himself?\n</div>\n// file: styles.pc\n<style>\n  :root {\n    --color-red-default: #900;\n  }\n\n  /* Try to avoid doing this \ud83d\ude45\u200d\u2642\ufe0f. Use mixins or class references instead. */\n  :global(body) {\n    font-family: Kai;\n    font-size: 18px;\n  }\n</style>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "It's okay to define ",
            Object(l.b)("inlineCode", { parentName: "p" }, ":root"),
            " variables - this is common pattern around theming. Try to avoid ",
            Object(l.b)("inlineCode", { parentName: "p" }, ":global"),
            " selectors whenever possible since they leak into other documents, and may result in unintended side-effects. If you need to use ",
            Object(l.b)("inlineCode", { parentName: "p" }, ":global"),
            " try to wrap it around a style rule that's scoped to the document. For example:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)({ parentName: "pre" }, { className: "language-css" }),
              "/* Safer to use */\n.container {\n  :global(body) {\n\n  }\n}\n"
            )
          ),
          Object(l.b)("h2", { id: "import" }, "Import"),
          Object(l.b)(
            "p",
            null,
            "You can import ",
            Object(l.b)(
              "a",
              Object(a.a)({ parentName: "p" }, { href: "#styling" }),
              "styles"
            ),
            " & ",
            Object(l.b)(
              "a",
              Object(a.a)({ parentName: "p" }, { href: "#components" }),
              "components"
            ),
            " from other files. "
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Syntax"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<import src="./path/to/document.pc" as="unique-namespace">\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Example"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '// file: main.pc\n<import src="./pane.pc" as="pane">\n<import src="./atoms.pc" as="atoms">\n\n<pane.Container>\n  <pane.Header>\n    <span className=">>>atoms.font-big">\n      Header content\n    </span>\n  </pane.Header>\n  <pane.Content>\n    Some content\n  </pane.Content>\n</pane.Container>\n\n\n// file: pane.pc\n<import src="./atoms.pc" as="atoms">\n<style>\n  .Container {\n    @include atoms.font-default;\n  }\n  .Header, .Content {\n    margin: 0px 8px;\n  }\n  .Header {\n    font-size: 18px;\n    font-weight: 600;\n  }\n  .Content {\n  }\n</style>\n\n<div export component as="Container" className="Container">\n  {children}\n</div>\n\n<div export component as="Header" className="Header">\n  {children}\n</div>\n\n<div export component as="Content" className="Content">\n  {children}\n</div>\n\n\x3c!-- Preview --\x3e\n\nNothing here!\n\n// file: atoms.pc\n\n<style>\n  @export {\n    @mixin font-default {\n      font-family: Helvetica;\n    }\n    .font-big {\n      @include font-default;\n      font-size: 24px;\n    }\n  }\n</style>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "The ",
            Object(l.b)("inlineCode", { parentName: "p" }, "as"),
            " keyword is your access point into anything exported by the imported document, like above. "
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Other examples"),
            ":"
          ),
          Object(l.b)(
            "ul",
            null,
            Object(l.b)(
              "li",
              { parentName: "ul" },
              Object(l.b)(
                "a",
                Object(a.a)({ parentName: "li" }, { href: "#export" }),
                "Exporting styles"
              )
            ),
            Object(l.b)(
              "li",
              { parentName: "ul" },
              Object(l.b)(
                "a",
                Object(a.a)(
                  { parentName: "li" },
                  { href: "#exporting-components" }
                ),
                "Exporting components"
              )
            )
          ),
          Object(l.b)("h2", { id: "components" }, "Components"),
          Object(l.b)("p", null, "Components are your UI building blocks. "),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Syntax"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '\n\x3c!-- defining the component --\x3e\n<element-name component as="my-component-name">\n</element-name>\n\n\x3c!-- using it --\x3e\n<my-component-name />\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Example"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '<style>\n  .Message {\n    font-family: Comic Sans MS;\n    font-size: 32px;\n    color: #F0F;\n  }\n</style>\n\n\x3c!-- Components section --\x3e\n\n\x3c!-- className and class can be used interchangeably --\x3e\n<div component as="Message" className="Message">\n  {children}\n</div>\n\n\x3c!-- Preview section --\x3e\n\n<Message>\n  Hooray!\n</Message>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "You can define a component from ",
            Object(l.b)("em", { parentName: "p" }, "any"),
            " root element (meaning that it's not a child of any element) by using the syntax above.  Any other element that does ",
            Object(l.b)("em", { parentName: "p" }, "not"),
            " have a ",
            Object(l.b)("inlineCode", { parentName: "p" }, "component"),
            " attribute is rendered to the screen. Think of those as previews. "
          ),
          Object(l.b)("h3", { id: "component-previews" }, "Component previews"),
          Object(l.b)(
            "p",
            null,
            "Anything that doesn't have a ",
            Object(l.b)("inlineCode", { parentName: "p" }, "component"),
            " attribute is rendered to the screen, so you can utilize that behavior to see what you're working on.  For example:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '// file: buttons.pc\n<import src="./styles.pc" as="styles">\n\n\x3c!-- Components --\x3e\n\n\x3c!-- >>> is a class reference -- docs below --\x3e\n<div component as="Button" \n  className=">>>styles.Button"\n  className:secondary=">>>styles.Button--secondary"\n  className:negate=">>>styles.Button--negate">\n  {children}\n</div>\n\n\x3c!-- Previews --\x3e\n\n<Button>primary</Button>\n<Button secondary>secondary</Button>\n<Button negate>negate</Button>\n<Button negate secondary>negate secondary</Button>\n\n// file: styles.pc\n\n<style>\n  :root {\n    --color-grey-primary: #999;\n    --color-red-primary: #990000;\n  }\n  \n  .Button {\n    font-family: Bradley Hand;\n    padding: 4px 10px;\n    background: var(--color-grey-primary);\n    color: white;\n    display: inline-block;\n    margin-left: 10px;\n    border-radius: 4px;\n    box-sizing: border-box;\n    border: 2px solid var(--color-grey-primary);\n    &--secondary {\n      background: transparent;\n      color: var(--color-grey-primary);\n    }\n    &--negate {\n      background: var(--color-red-primary);\n      border-color: var(--color-red-primary);\n    }\n    &--negate&--secondary {\n      background: transparent;\n      color: var(--color-red-primary);\n    }\n  }\n</style>\nNothing to see here!\n'
            )
          ),
          Object(l.b)(
            "blockquote",
            null,
            Object(l.b)(
              "p",
              { parentName: "blockquote" },
              "Check out the ",
              Object(l.b)(
                "a",
                Object(a.a)(
                  { parentName: "p" },
                  {
                    href:
                      "https://github.com/crcn/paperclip/blob/master/examples/react-todomvc/src/app.pc"
                  }
                ),
                "React Todo MVC Example"
              ),
              " if you're looking for a more extensive demo. "
            )
          ),
          Object(l.b)(
            "p",
            null,
            "I'd recommend that you render every visual state of your UI in Paperclip since since that will enable you to set up more reliable ",
            Object(l.b)(
              "a",
              Object(a.a)(
                { parentName: "p" },
                { href: "safety-visual-regression.md" }
              ),
              "visual regression tests"
            ),
            ". Also note that preview elements won't affect your application size since they're not compiled, so you can write previews to your hearts content. "
          ),
          Object(l.b)(
            "h3",
            { id: "exporting-components" },
            "Exporting components"
          ),
          Object(l.b)(
            "p",
            null,
            "Components can be exported to be used in application code, as well as other documents."
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Syntax"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '\n\x3c!-- just add the "export" attribute to any component --\x3e\n<div export component as="MyComponent">\n</div>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Example"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '// file: todos.pc\n<import src="./styles.pc" as="styles">\n\n\x3c!-- Components --\x3e\n\n<div export component as="App" className=">>>styles.App">\n  {children}\n</div>\n\n<input export component as="NewItemInput" {onChange} />\n\n<div export component as="Header" className=">>>styles.Header">\n  <h4>Todos</h4>\n  {children}\n</div>\n\n<ul export component as="List" className=">>>styles.List">\n  {children}\n</ul>\n\n<li export component as="Item" className=">>>styles.Item" {onClick}>\n  <input type="checkbox" checked={completed}> \n  <span className=">>>styles.label">{children}</span>\n</li>\n\n\x3c!-- Preview --\x3e\n\n<App>\n  <Header>\n    <NewItemInput />\n  </Header>\n  <List>\n    <Item>Wash car</Item>\n    <Item>Wash car</Item>\n    <Item completed>Wash car</Item>\n  </List>\n</App>\n\n// file: styles.pc\n\n\x3c!-- Typically in the same file as components, but they\'re here for this demo since they\'re not the focus. --\x3e\n<style>\n  .App {\n    font-family: Chalkduster;\n  }\n  .Header {  \n    h4 {\n      margin: 0;\n      margin-bottom: 8px;\n    }\n    margin-bottom: 8px;\n  }\n  .List {\n    margin: 0;\n    padding: 0;\n    list-style-type: none;\n  }\n  .Item {\n\n    // Needs\n    :global(input[type="checkbox"]) {\n      margin-right: 8px;\n      &:checked ~ .label {\n        text-decoration: line-through;\n      }\n    }\n  }\n</style>\n\nNo preview here!\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "Here's how we can use this in our React app:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)({ parentName: "pre" }, { className: "language-jsx" }),
              'import React, { useRef, useState } from "react";\nimport * as ui from "./todos.pc"\n\nconst TodoApp = () => {\n  const [todos, setTodos] = useState([\n    { completed: true, label: "walk dog" },\n    { completed: true, label: "take out trash" }\n  ]);\n\n  const onNewInputChange = (event) => {\n    // code to add new todo item here\n  }\n\n  return <ui.App>\n    <ui.Header>\n      <NewItemInput onChange={} />\n      <ui.List>\n        {todos.map(({completed, label}, i) => (\n          <ui.Item \n            onClick={/* toggle completed handler here */} \n            completed={completed}>\n            {label}\n          <ui.Item>\n        ))}\n      </ui.List>\n    </ui.Header>\n  </ui.App>;\n}\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "We can also use our exported component in other Paperclip documents. Here's an example:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '// file: importing-components-demo.pc\n<import src="./todos.pc" as="todos">\n\n<style>\n  .preview {\n    display: flex;\n    &-item {\n      margin-left: 20px;\n    }\n  }\n</style>\n\n<div className="preview">\n  <todos.Preview className=">>>preview-item" />\n  <todos.EmptyPreview className=">>>preview-item" />\n</div>\n\n// file: todos.pc\n<import src="./styles.pc" as="styles">\n\n\x3c!-- Components --\x3e\n\n<div export component as="App" className=">>>styles.App {className?}">\n  {children}\n</div>\n\n<input export component as="NewItemInput" {onChange} />\n\n<div export component as="Header" className=">>>styles.Header">\n  <h4>Todos</h4>\n  {children}\n</div>\n\n<ul export component as="List" className=">>>styles.List">\n  {children}\n</ul>\n\n<li export component as="Item" className=">>>styles.Item" {onClick}>\n  <input type="checkbox" checked={completed}> \n  <span className=">>>styles.label">{children}</span>\n</li>\n\n\x3c!-- Export re-usable previews that can be used\nin other previews --\x3e\n\n<App export component as="Preview" {className?}>\n  <Header>\n    <NewItemInput />\n  </Header>\n  <List>\n    <Item>Clean cat car</Item>\n    <Item>Wash car</Item>\n    <Item completed>Wash car</Item>\n  </List>\n</App>\n\n\n<App export component as="EmptyPreview" {className?}>\n  <Header>\n    <NewItemInput />\n  </Header>\n  Nothing to see here\n</App>\n\n\x3c!-- render main preview --\x3e\n<Preview />\n\n// file: styles.pc\n\n\x3c!-- Typically in the same file as components, but they\'re here for this demo since they\'re not the focus. --\x3e\n<style>\n  .App {\n    font-family: Chalkduster;\n  }\n  .Header {  \n    h4 {\n      margin: 0;\n      margin-bottom: 8px;\n    }\n    margin-bottom: 8px;\n  }\n  .List {\n    margin: 0;\n    padding: 0;\n    list-style-type: none;\n  }\n  .Item {\n\n    // Needs\n    :global(input[type="checkbox"]) {\n      margin-right: 8px;\n      &:checked ~ .label {\n        text-decoration: line-through;\n      }\n    }\n  }\n</style>\n\nNo preview here!\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "\u261d\ud83c\udffb This is a pattern is pretty useful - creating various ",
            Object(l.b)("inlineCode", { parentName: "p" }, "preview"),
            " components & then using them in other documents to preview your entire application UI. They're removed from your application bundle (so long as you don't use them in app code) because of ",
            Object(l.b)(
              "a",
              Object(a.a)(
                { parentName: "p" },
                { href: "https://webpack.js.org/guides/tree-shaking/" }
              ),
              "tree-shaking"
            ),
            "."
          ),
          Object(l.b)(
            "h3",
            { id: "overriding-component-styles" },
            "Overriding component styles"
          ),
          Object(l.b)(
            "p",
            null,
            "You can override styles in other components assuming that a component exposes an attribute that's bound to ",
            Object(l.b)("inlineCode", { parentName: "p" }, "className"),
            ". "
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Syntax"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              'attributeBoundToClassName=">>>class-name"\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Example"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '// file: style-override-demo.pc\n<import as="Message" src="./message.pc">\n<style>\n  .my-style-override {\n    text-decoration: underline;\n  }\n</style>\n<Message className=">>>my-style-override">\n  Hello World\n</Message>\n\n// file: message.pc\n\n<style>\n  .message {\n    font-size: 24px;\n    font-family: Helvetica;\n  }\n</style>\n<div export component as="default" className="message {className?}">\n  {children}\n</div>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "Check out ",
            Object(l.b)(
              "a",
              Object(a.a)({ parentName: "p" }, { href: "#class-reference" }),
              "class references"
            ),
            " for more information on how to use ",
            Object(l.b)("inlineCode", { parentName: "p" }, ">>>"),
            "."
          ),
          Object(l.b)("h2", { id: "bindings" }, "Bindings"),
          Object(l.b)(
            "p",
            null,
            "Bindings allow you to define dynamic behavior in components."
          ),
          Object(l.b)("h3", { id: "child-bindings" }, "Child bindings"),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Syntax"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<div component as="MyComponent">\n\n  \x3c!-- reserved keyword - takes element children. --\x3e\n  {children}\n  \n  \x3c!-- can be defined via attributes --\x3e\n  {anotherSlot}\n</div>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Example"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '<h1 component as="Header">\n  {children}\n</h1>\n\n<Header>\n  I\'m not a header\n</Header>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "There will probably be the case where you want to define multiple areas of a component for children to go into. Here's an example of that:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '// file: main.pc\n<import src="./styles.pc" as="styles">\n\n\x3c!-- Components --\x3e\n\n<div component as="Pane" className=">>>styles.Pane">\n  <div className=">>>styles.header">\n    <div className=">>>styles.title">{title}</div>\n    <div className=">>>styles.controls">{controls}</div>\n  </div>\n  <div className=">>>styles.content">\n    {children}\n  </div>\n</div>\n\n<div component as="AddButton">\n  +\n</div>\n\n\x3c!-- Previews --\x3e\n\n<Pane title={<strong>My header</strong>} controls={<AddButton />}>\n  Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n</Pane>\n\n// file: styles.pc\n\n\x3c!-- keeping this in another file so that it\'s not the center of attention --\x3e\n<style>\n  @export {\n    .Pane {\n      font-family: Courier;\n      width: 200px;\n      color: #333;\n      .header, .content {\n        padding: 4px 8px;\n      }\n      .header {\n        background: #C0C0C0;\n        display: flex;\n        .title {\n          flex-grow: 1;\n        }\n      }\n      .content {\n        background: #CFCFCFCF;\n        padding: 4px;\n      }\n    }\n  }\n</style>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("inlineCode", { parentName: "p" }, "{title}"),
            " and ",
            Object(l.b)("inlineCode", { parentName: "p" }, "{controls}"),
            " (and technically also ",
            Object(l.b)("inlineCode", { parentName: "p" }, "{children}"),
            ") are considered ",
            Object(l.b)("em", { parentName: "p" }, "slots"),
            " for child nodes to go into, and they can be filled in via attributes:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              "<Pane \n  title={<span>some title</span>} \n  controls={<button>A button</button>}>\n  Content children\n</Pane>\n"
            )
          ),
          Object(l.b)("h3", { id: "attribute-bindings" }, "Attribute bindings"),
          Object(l.b)(
            "p",
            null,
            "Attributes allow you to define dynamic component properties. For example:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '// file: buttons.pc\n<import src="./typography.pc" as="typography">\n<import src="./styles.pc" as="styles">\n\n\x3c!-- Components --\x3e\n\n\x3c!-- Generally I\'d recommend just a `{className}` binding instead of `{customClassName}` class name, which I\'m only using here to make more clear around how it works. --\x3e\n<div component as="Button" \n  className=">>>styles.button {customClassName}">\n  {children}\n</div>\n\n\x3c!-- Previews --\x3e\n\n<Button customClassName=">>>typography.big-text >>>typography.strong">\n  Button\n</Button>\n\n// file: styles.pc\n<import src="./typography.pc" as="typography">\n<style>\n  @export {\n    .button {\n      color: red;\n      @include typography.default-text;\n    }\n  }\n</style>\n\nNothing to see!\n\n// file: typography.pc\n<style>\n  @export {\n    @mixin default-font {\n      font-family: Helvetica;\n    }\n    @mixin default-text {\n      @include default-font;\n      font-size: 18px;\n      color: #333;\n    }\n    .big-text {\n      @include default-font;\n      font-size: 32px;\n      font-weight: \n    }\n    .strong {\n      font-weight: 800;\n    }\n  }\n</style>\n\nNothing to see!\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "Bindings can also be defined outside of string attributes. For example:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<div component as="Test">\n  <span className="title" ref={spanRef}>\n    {title}\n  </span>\n  {children}\n</div>\n'
            )
          ),
          Object(l.b)(
            "blockquote",
            null,
            Object(l.b)(
              "p",
              { parentName: "blockquote" },
              "Ref here is specific to React around referencing DOM nodes. "
            )
          ),
          Object(l.b)(
            "p",
            null,
            "You can also use the shorthand approach like so:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<div component as="Test">\n  <span className="title" {spanRef}>\n    {title}\n  </span>\n  {children}\n</div>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "This is particularly useful for making your code more DRY. For example:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<input\xa0export component as="Input" \n  {onChange?} \n  {defaultValue}\n  {value}\n/>\n'
            )
          ),
          Object(l.b)("h3", { id: "optional-bindings" }, "Optional bindings"),
          Object(l.b)(
            "p",
            null,
            "By default, bindings are required. So if you define ",
            Object(l.b)("inlineCode", { parentName: "p" }, "{className}"),
            " on an element, that property will be required when compiled into application code. To make a binding optional, just add a ",
            Object(l.b)("inlineCode", { parentName: "p" }, "?"),
            " after the binding name like so:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<div component as="Message" {className?}>\n  {children}\n</div>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "\u261d\ud83c\udffb Here, ",
            Object(l.b)("inlineCode", { parentName: "p" }, "className"),
            " is optional, whereas ",
            Object(l.b)("inlineCode", { parentName: "p" }, "children"),
            " is not. When compiled to TypeScript, here's what you get:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-typescript" }
              ),
              "/* other generated code here */\n\ntype MessageProps = {\n  className?: Function,\n  children: ReactNode,\n};\n\nexport const Message: React.FC<MessageProps>;\n"
            )
          ),
          Object(l.b)(
            "blockquote",
            null,
            Object(l.b)(
              "p",
              { parentName: "blockquote" },
              "For more information around type safety, take a look at the ",
              Object(l.b)(
                "a",
                Object(a.a)(
                  { parentName: "p" },
                  { href: "safety-type-definitions" }
                ),
                "type safety doc"
              ),
              "."
            )
          ),
          Object(l.b)("h3", { id: "variant-styles" }, "Variant styles"),
          Object(l.b)(
            "p",
            null,
            "The variant style syntax allows you to apply classes based on component properties - useful for creating variants."
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Syntax"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<div component as="MyComponent" className:variant-name="class-name">\n</div>\n\n\x3c!-- Usage --\x3e\n\n<MyComponent variant-name />\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("strong", { parentName: "p" }, "Example"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '<style>\n  .Header {\n    font-family: Luminari;\n    font-size: 12px;\n\n    /* I recommend that you do this instead of &.big to avoid\n    CSS specificity issues */\n    &--big {\n      font-size: 32px;\n    }\n    &--medium {\n      font-size: 18px;\n    }\n    &--small {\n      font-size: 12px;\n    }\n  }\n</style>\n\n<div component as="Header"\n  className="Header"\n  className:big="Header--big"\n  className:medium="Header--medium"\n  className:small="Header--small">\n  {children}\n</div>\n\n<Header big>\n  Big header\n</Header>\n<Header medium>\n  Medium header\n</Header>\n<Header small>\n  Small header\n</Header>\n<Header>\n  Regular header\n</Header>\n'
            )
          ),
          Object(l.b)("h2", { id: "fragments" }, "Fragments"),
          Object(l.b)(
            "p",
            null,
            "Fragments are useful if you want to render a collection of elements. For example:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '<ul component as="List">\n  {listItems}\n</ul>\n\n<List\n  listItems={<fragment>\n    <li>feed fish</li>\n    <li>feed cat</li>\n    <li>feed me</li>\n  </fragment>}\n/>\n'
            )
          ),
          Object(l.b)("p", null, "You can also define components from them:"),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(a.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<fragment component as="Items">\n  <li>Item</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n  <li>Item 4</li>\n</fragment>\n\n<ul>\n  <Items />\n</ul>\n'
            )
          )
        );
      }
      p.isMDXComponent = !0;
    },
    204: function(e, n, t) {
      "use strict";
      t.d(n, "a", function() {
        return m;
      }),
        t.d(n, "b", function() {
          return u;
        });
      var a = t(0),
        o = t.n(a);
      function l(e, n, t) {
        return (
          n in e
            ? Object.defineProperty(e, n, {
                value: t,
                enumerable: !0,
                configurable: !0,
                writable: !0
              })
            : (e[n] = t),
          e
        );
      }
      function r(e, n) {
        var t = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var a = Object.getOwnPropertySymbols(e);
          n &&
            (a = a.filter(function(n) {
              return Object.getOwnPropertyDescriptor(e, n).enumerable;
            })),
            t.push.apply(t, a);
        }
        return t;
      }
      function s(e) {
        for (var n = 1; n < arguments.length; n++) {
          var t = null != arguments[n] ? arguments[n] : {};
          n % 2
            ? r(Object(t), !0).forEach(function(n) {
                l(e, n, t[n]);
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : r(Object(t)).forEach(function(n) {
                Object.defineProperty(
                  e,
                  n,
                  Object.getOwnPropertyDescriptor(t, n)
                );
              });
        }
        return e;
      }
      function c(e, n) {
        if (null == e) return {};
        var t,
          a,
          o = (function(e, n) {
            if (null == e) return {};
            var t,
              a,
              o = {},
              l = Object.keys(e);
            for (a = 0; a < l.length; a++)
              (t = l[a]), n.indexOf(t) >= 0 || (o[t] = e[t]);
            return o;
          })(e, n);
        if (Object.getOwnPropertySymbols) {
          var l = Object.getOwnPropertySymbols(e);
          for (a = 0; a < l.length; a++)
            (t = l[a]),
              n.indexOf(t) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(e, t) &&
                  (o[t] = e[t]));
        }
        return o;
      }
      var i = o.a.createContext({}),
        p = function(e) {
          var n = o.a.useContext(i),
            t = n;
          return e && (t = "function" == typeof e ? e(n) : s(s({}, n), e)), t;
        },
        m = function(e) {
          var n = p(e.components);
          return o.a.createElement(i.Provider, { value: n }, e.children);
        },
        b = {
          inlineCode: "code",
          wrapper: function(e) {
            var n = e.children;
            return o.a.createElement(o.a.Fragment, {}, n);
          }
        },
        d = o.a.forwardRef(function(e, n) {
          var t = e.components,
            a = e.mdxType,
            l = e.originalType,
            r = e.parentName,
            i = c(e, ["components", "mdxType", "originalType", "parentName"]),
            m = p(t),
            d = a,
            u = m["".concat(r, ".").concat(d)] || m[d] || b[d] || l;
          return t
            ? o.a.createElement(u, s(s({ ref: n }, i), {}, { components: t }))
            : o.a.createElement(u, s({ ref: n }, i));
        });
      function u(e, n) {
        var t = arguments,
          a = n && n.mdxType;
        if ("string" == typeof e || a) {
          var l = t.length,
            r = new Array(l);
          r[0] = d;
          var s = {};
          for (var c in n) hasOwnProperty.call(n, c) && (s[c] = n[c]);
          (s.originalType = e),
            (s.mdxType = "string" == typeof e ? e : a),
            (r[1] = s);
          for (var i = 2; i < l; i++) r[i] = t[i];
          return o.a.createElement.apply(null, r);
        }
        return o.a.createElement.apply(null, t);
      }
      d.displayName = "MDXCreateElement";
    }
  }
]);
