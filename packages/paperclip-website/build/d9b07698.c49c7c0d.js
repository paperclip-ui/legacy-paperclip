(window.webpackJsonp = window.webpackJsonp || []).push([
  [34],
  {
    135: function(e, n, t) {
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
      var o = t(2),
        a = t(6),
        l = (t(0), t(143)),
        r = {
          id: "usage-syntax",
          title: "Paperclip Syntax",
          sidebar_label: "Syntax"
        },
        s = {
          id: "usage-syntax",
          isDocsHomePage: !1,
          title: "Paperclip Syntax",
          description: "Styling",
          source: "@site/docs/usage-syntax.md",
          permalink: "/docs/usage-syntax",
          editUrl:
            "https://github.com/crcn/paperclip/packages/edit/master/website/docs/usage-syntax.md",
          sidebar_label: "Syntax",
          sidebar: "docs",
          previous: {
            title: "Using Paperclip in React apps",
            permalink: "/docs/usage-react"
          },
          next: { title: "Command line tools", permalink: "/docs/usage-cli" }
        },
        c = [
          {
            value: "Styling",
            id: "styling",
            children: [
              {
                value: "Class references",
                id: "class-references",
                children: []
              },
              { value: "Variant styles", id: "variant-styles", children: [] },
              { value: "Style mixins", id: "style-mixins", children: [] },
              {
                value: "Exporting styles",
                id: "exporting-styles",
                children: []
              },
              {
                value: "Global selectors",
                id: "global-selectors",
                children: []
              }
            ]
          },
          {
            value: "Components",
            id: "components",
            children: [
              {
                value: "Exporting components",
                id: "exporting-components",
                children: []
              },
              {
                value: "Default components",
                id: "default-components",
                children: []
              }
            ]
          },
          {
            value: "Bindings",
            id: "bindings",
            children: [
              {
                value: "Attribute bindings",
                id: "attribute-bindings",
                children: []
              },
              {
                value: "HTML in bindings",
                id: "html-in-bindings",
                children: []
              },
              {
                value: "Optional bindings",
                id: "optional-bindings",
                children: []
              }
            ]
          },
          {
            value: "Importing documents",
            id: "importing-documents",
            children: [
              {
                value: "Rendering components from import",
                id: "rendering-components-from-import",
                children: []
              }
            ]
          },
          { value: "Fragments", id: "fragments", children: [] }
        ],
        i = { rightToc: c };
      function p(e) {
        var n = e.components,
          t = Object(a.a)(e, ["components"]);
        return Object(l.b)(
          "wrapper",
          Object(o.a)({}, i, t, { components: n, mdxType: "MDXLayout" }),
          Object(l.b)("h2", { id: "styling" }, "Styling"),
          Object(l.b)(
            "p",
            null,
            "You can style elements using the native ",
            Object(l.b)("inlineCode", { parentName: "p" }, "<style />"),
            " element. ",
            Object(l.b)(
              "strong",
              { parentName: "p" },
              "Note that styles are scoped to the template, meaning that they won't leak to ",
              Object(l.b)("em", { parentName: "strong" }, "other"),
              " templates."
            ),
            " For example:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              "<style>\n  div {\n    color: red;\n  }\n</style> \n\n<div>Something</div>\n"
            )
          ),
          Object(l.b)(
            "p",
            null,
            "The ",
            Object(l.b)("inlineCode", { parentName: "p" }, "div { }"),
            " rule here is only applied to ",
            Object(l.b)(
              "inlineCode",
              { parentName: "p" },
              "<div>Something</div>"
            ),
            "."
          ),
          Object(l.b)("h3", { id: "class-references" }, "Class references"),
          Object(l.b)(
            "p",
            null,
            "Class references allow you to explicitly reference class names, and it's a way to define or reference styles in other files. Suppose for example I have a module ",
            Object(l.b)("inlineCode", { parentName: "p" }, "message.pc"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<style>\n  .message {\n    font-size: 24px;\n    font-family: Helvetica;\n  }\n</style>\n<div export component as="default" className="message {className?}">\n  {message}\n</div>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "\u261d\ud83c\udffbThis component allows for class names to be assigned to it. Here's how we do that:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<import as="Message" src="./message.pc">\n<style>\n  .my-style-overide {\n    text-decoration: underline;\n  }\n</style>\n<Message className=">>>my-style-override">\n  Hello World\n</Messsage>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "The ",
            Object(l.b)(
              "inlineCode",
              { parentName: "p" },
              ">>>my-style-override"
            ),
            " is like an explicit reference to ",
            Object(l.b)(
              "inlineCode",
              { parentName: "p" },
              ".my-style-override"
            ),
            " -- it tells Paperclip to attach special scope properties to ",
            Object(l.b)("inlineCode", { parentName: "p" }, "my-style-override"),
            " so that the message component receives the style."
          ),
          Object(l.b)(
            "p",
            null,
            "We can also reference styles from imported documents. For that, check out the ",
            Object(l.b)("inlineCode", { parentName: "p" }, "@exports"),
            " section."
          ),
          Object(l.b)("h3", { id: "variant-styles" }, "Variant styles"),
          Object(l.b)(
            "p",
            null,
            "the ",
            Object(l.b)("inlineCode", { parentName: "p" }, "class:prop"),
            " functionality allows you to easily create variants of a component. For example:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<style>\n  .button {\n    color: black;\n    &--alt {\n      color: red;\n    }\n    &--secondary {\n      color: gold;\n    }\n  }\n</style>\n\n<div component as="Button" \n  class="button" \n  class:alt="button--alt" \n  class:secondary="button--secondary">\n  {children}\n</div>\n\n<Button>\n  I\'m the default button\n</Button>\n<Button alt>\n  I\'m an alt button\n</Button>\n<Button secondary>\n  I\'m the secondary button\n</Button>\n'
            )
          ),
          Object(l.b)("p", null, "You can also use the shorthand version:"),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<style>\n  .button {\n    color: black;\n    &.alt {\n      color: red;\n    }\n  }\n</style>\n\n<div component as="Button" \n  class="button" \n  class:alt>\n  {children}\n</div>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "However, be aware that using the shorthand version may prevent you from overriding styles because of ",
            Object(l.b)(
              "a",
              Object(o.a)(
                { parentName: "p" },
                {
                  href:
                    "https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity"
                }
              ),
              "CSS specificity"
            ),
            "."
          ),
          Object(l.b)("h3", { id: "style-mixins" }, "Style mixins"),
          Object(l.b)(
            "p",
            null,
            "Mixins allow us to define a group of CSS properties to use in style rules. For example:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              "<style>\n  @mixin default-font {\n    font-family: Helvetica;\n    color: #333;\n  }\n\n  @mixin big-text {\n    font-size: 24px;\n  }\n\n  .header {\n    @include big-text default-font;\n  }\n</style>\n"
            )
          ),
          Object(l.b)(
            "p",
            null,
            "\u261d\ud83c\udffb ",
            Object(l.b)("inlineCode", { parentName: "p" }, ".header"),
            " in this case is transformed into:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)({ parentName: "pre" }, { className: "language-css" }),
              ".header {\n  font-family: Helvetica;\n  color: #333;\n  font-size: 24px;\n}\n"
            )
          ),
          Object(l.b)("h3", { id: "exporting-styles" }, "Exporting styles"),
          Object(l.b)(
            "p",
            null,
            "The ",
            Object(l.b)("inlineCode", { parentName: "p" }, "@export"),
            " util allows us to export mixins, classes, and keyframes. For example, suppose you have a ",
            Object(l.b)("inlineCode", { parentName: "p" }, "typography.pc"),
            " file:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              "<style>\n  @export {\n    @mixin default-font {\n      font-family: Helvetica;\n      color: #333;\n    }\n\n    @mixin big-text {\n      font-size: 24px;\n    }\n\n    .header {\n      @include big-text default-font;\n    }\n  }\n</style>\n"
            )
          ),
          Object(l.b)("p", null, "You can use those exports like so:"),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<import as="typography" src="design-system/typography.pc">\n\n<style>\n  .some-style {\n    @include typography.big-text;\n  }\n</style>\n\n<div className=">>>typography.header">\n  Something\n</div>\n'
            )
          ),
          Object(l.b)("h3", { id: "global-selectors" }, "Global selectors"),
          Object(l.b)(
            "p",
            null,
            "Global selectors allow you to apply styles ",
            Object(l.b)("em", { parentName: "p" }, "outside"),
            " of the scope of this file. To do that, you can define:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)({ parentName: "pre" }, { className: "language-css" }),
              ":global(.selector) {\n  color: red;\n}\n"
            )
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)(
              "strong",
              { parentName: "p" },
              "This property should be reserved for very special cases whre you need it."
            ),
            " For most other cases where you need to override styles, I'd recomend you use the style piercing operator (",
            Object(l.b)("inlineCode", { parentName: "p" }, ">>>"),
            ")."
          ),
          Object(l.b)("h2", { id: "components" }, "Components"),
          Object(l.b)(
            "p",
            null,
            "Components are useful for reusing groups of elements & text. Here's how you create one:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<div component as="Message">\n  Hello {text}\n</div>\n\n\x3c!-- prints Hello World --\x3e\n<Message text="World" />\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "Components are defined by adding a ",
            Object(l.b)("inlineCode", { parentName: "p" }, "component"),
            " and ",
            Object(l.b)("inlineCode", { parentName: "p" }, "as"),
            " attribute to any element at the highest level in the template document. "
          ),
          Object(l.b)(
            "blockquote",
            null,
            Object(l.b)(
              "p",
              { parentName: "blockquote" },
              "Note that you can name components however you want, just bare in mind that the names will be in ",
              Object(l.b)("inlineCode", { parentName: "p" }, "PascalCase"),
              " when they're compiled to code. Because of that, I'd recommend using ",
              Object(l.b)("inlineCode", { parentName: "p" }, "PascalCase"),
              " for component names to make things more obvious."
            )
          ),
          Object(l.b)(
            "h3",
            { id: "exporting-components" },
            "Exporting components"
          ),
          Object(l.b)(
            "p",
            null,
            "If you want to use components in JavaScript code, you'll need to define an ",
            Object(l.b)("inlineCode", { parentName: "p" }, "export"),
            " attribute. For example:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '\x3c!-- counter.pc --\x3e\n<div export component as="Counter" {onClick}>\n  Hello {currentCount}\n</div>\n'
            )
          ),
          Object(l.b)("p", null, "Then in JSX code, you can import component:"),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-javascript" }
              ),
              'import {Counter as CounterView} from "./message.pc";\nimport React, {useState} from "react";\n\nexport function Counter() {\n  const [currentCount, setCount] = useState(0);\n  const onClick = () => setCount(currentCount + 1);\n\n  return <CounterView \n    currentCount={currentCount} \n    onClick={onClick} \n  />;\n};\n'
            )
          ),
          Object(l.b)("h3", { id: "default-components" }, "Default components"),
          Object(l.b)(
            "p",
            null,
            "Default exports can be defined using ",
            Object(l.b)("inlineCode", { parentName: "p" }, "default"),
            " for the ",
            Object(l.b)("inlineCode", { parentName: "p" }, "as"),
            " attribute:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '\x3c!-- counter.pc --\x3e\n<div export component as="default" {onClick}>\n  Hello {currentCount}\n</div>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "Here's how you import this component is JSX code:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-javascript" }
              ),
              'import CounterView from "./counter.pc";\nimport React, {useState} from "react";\n\nexport function Counter() {\n\n  // code here...\n  const currentCount = 0;\n  const onClick = () => {};\n  return <CounterView \n    currentCount={currentCount} \n    onClick={onClick} \n  />;\n};\n'
            )
          ),
          Object(l.b)("h2", { id: "bindings" }, "Bindings"),
          Object(l.b)(
            "p",
            null,
            "Bindings help you define dynamic parts of your components. For example:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<div component as="Message">\n  Hello {text}\n</div>\n\n<Message text="World" />\n<Message text={<strong>World</strong>} />\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("inlineCode", { parentName: "p" }, "{children}"),
            " behaves a bit differently:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<div component as="Message">\n  Hello {children}\n</div>\n\n<Message>\n  <strong>World</strong>\n</Message>\n'
            )
          ),
          Object(l.b)("h3", { id: "attribute-bindings" }, "Attribute bindings"),
          Object(l.b)("p", null, "Example:"),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '\n<style>\n  .red {\n    color: red;\n  }\n  .blue {\n    color: blue;\n  }\n</style>\n\n<div export component as="Message" class={class}>\n  {children}\n</div>\n\n<Message class="red">\n  Hello World\n</Message>\n\n<Message class="blue">\n  Hello World\n</Message>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "Since the attribute key & binding share the same name, we can use the ",
            Object(l.b)("strong", { parentName: "p" }, "shorthand approach"),
            ":"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '\x3c!-- styles here --\x3e\n<div export component as="Message" {class}>\n  {children}\n</div>\n\n<Message class="red">\n  Hello World\n</Message>\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "We can also include bindings in attribute strings. For example:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '\x3c!-- styles here --\x3e\n<div export component as="Message" className="some-class {className}">\n  {children}\n</div>\n\n<Message class="red">\n  Hello World\n</Message>\n'
            )
          ),
          Object(l.b)(
            "blockquote",
            null,
            Object(l.b)(
              "p",
              { parentName: "blockquote" },
              "\u261d\ud83c\udffb The ",
              Object(l.b)("inlineCode", { parentName: "p" }, "class"),
              " attribute can also be defined as ",
              Object(l.b)("inlineCode", { parentName: "p" }, "className"),
              ". Though, I'd recommend using ",
              Object(l.b)("inlineCode", { parentName: "p" }, "className"),
              " instead if you're\nusing these components in JSX for consistency. "
            )
          ),
          Object(l.b)("h3", { id: "html-in-bindings" }, "HTML in bindings"),
          Object(l.b)("p", null, "Bindings can also take HTML like so:"),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<div export component as="Panel">\n  <div className="header">{header}</div>\n  <div className="content">{content}</div>\n</div>\n\n<Panel\n  header={<h1>I\'m a header</h1>}\n  content={<AnotherComponent>More stuff</AnotherComponent>}\n/>\n'
            )
          ),
          Object(l.b)("h3", { id: "optional-bindings" }, "Optional bindings"),
          Object(l.b)(
            "p",
            null,
            "Paperclip supports optional properties like so:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<div export component as="Test">\n  {fullName?.first}\n</div>\n'
            )
          ),
          Object(l.b)("p", null, "Which is translated into something like:"),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-typescript" }
              ),
              "type TestProps = {\n  fullName?: {\n    first: any\n  }\n};\n\nexport const Test = (props: TestProps) => {\n  return <div>\n    {props.fullName && props.fullName.first}\n  </div>;\n};\n"
            )
          ),
          Object(l.b)(
            "h2",
            { id: "importing-documents" },
            "Importing documents"
          ),
          Object(l.b)(
            "blockquote",
            null,
            Object(l.b)(
              "p",
              { parentName: "blockquote" },
              "For a good example of this, check out the ",
              Object(l.b)(
                "a",
                Object(o.a)(
                  { parentName: "p" },
                  { href: "./../examples/react-todomvc" }
                ),
                "React TodoMVC example"
              ),
              "."
            )
          ),
          Object(l.b)(
            "p",
            null,
            Object(l.b)("inlineCode", { parentName: "p" }, "<import />"),
            " allows you to import other templates into your component files.  Suppose you have a ",
            Object(l.b)("inlineCode", { parentName: "p" }, "todo-item.pc"),
            " file:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<li export component as="default">{label}</li>\n'
            )
          ),
          Object(l.b)("p", null, "You can import that file like so:"),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '\x3c!-- todo-list.pc --\x3e\n<import as="TodoItem" src="./todo-item.pc">\n\n<ul component as="TodoItems">\n  {todoItems}\n</ul>\n\n\x3c!-- preview --\x3e\n<TodoItems\n  todoItems={<fragment>\n    <TodoItem label="wash car" />\n    <TodoItem label="feed dog" />\n  </fragment>}\n/>\n'
            )
          ),
          Object(l.b)(
            "blockquote",
            null,
            Object(l.b)(
              "p",
              { parentName: "blockquote" },
              "For  ",
              Object(l.b)(
                "inlineCode",
                { parentName: "p" },
                "<fragment></fragment>"
              ),
              " docs, check ",
              Object(l.b)(
                "a",
                Object(o.a)({ parentName: "p" }, { href: "#fragments-" }),
                "here"
              ),
              "."
            )
          ),
          Object(l.b)(
            "h3",
            { id: "rendering-components-from-import" },
            "Rendering components from import"
          ),
          Object(l.b)(
            "p",
            null,
            "In some cases you may want to use different components from your imported file. For example:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<style>\n  li.completed {\n    text-decoration: line-through;\n  }\n</style>\n\n<li export component as="default" class:completed>\n  <input type="checkbox" onClick={onCompleteCheckboxClick}>\n  {label}\n</li>\n\x3c!--  \n  Part that is used to preview component. no-compile tells\n  compilers not to include this part.\n--\x3e\n\n<default export component as="CompletedPreview" {label} completed />\n<default export component as="IncompletePreview" {label} />\n'
            )
          ),
          Object(l.b)(
            "p",
            null,
            "\u261d\ud83c\udffb",
            Object(l.b)("inlineCode", { parentName: "p" }, "CompletedPreview"),
            ", and ",
            Object(l.b)("inlineCode", { parentName: "p" }, "IncompletePreview"),
            " give us different previews of our ",
            Object(l.b)("inlineCode", { parentName: "p" }, "TodoItem"),
            " component. To use these parts in an import, we can do something like this:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '\x3c!-- todo-list.pc --\x3e\n\n<import as="TodoItem" src="./todo-item.pc">\n\n<div export component as="TodoList">\n\n  <h1>Todos:</h1>\n  <input type="text" onKeyPress={onNewTodoKeyPress}>\n\n  <ul>\n    {todoItems}\n  </ul>\n</div>\n\n<TodoList todoItems={<fragment>\n  <TodoItem:CompletedPreview label="Clean car" />\n  <TodoItem:IncompletePreview label="Walk dog" />\n</fragment>} />\n'
            )
          ),
          Object(l.b)("p", null, "Here's what the preview looks like:"),
          Object(l.b)(
            "p",
            null,
            Object(l.b)(
              "img",
              Object(o.a)(
                { parentName: "p" },
                { src: "assets/todos-demo.png", alt: "todos demo" }
              )
            )
          ),
          Object(l.b)(
            "p",
            null,
            "The JSX usage code for that might look something like:"
          ),
          Object(l.b)(
            "pre",
            null,
            Object(l.b)(
              "code",
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-javascript" }
              ),
              '// todo-list.jsx \n\nimport React from "react";\nimport {TodoList as TodoListView} from "./todo-list.pc";\n\n// We\'re using the TodoItem component assuming that it\'s using the todo-item.pc template.\nimport TodoItem from "./todo-item.tsx";\n\nexport function TodoList() {\n  const todos = [\n    { label: "Eat food" },\n    { label: "Wash car" }\n  ];\n\n  return <TodoListView todoItems={\n    todos.map(todo => <TodoItem item={item} />)\n  } />\n}\n'
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
              Object(o.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<ul component as="List">\n  {listItems}\n</ul>\n\n<List\n  listItems={<fragment>\n    <li>feed fish</li>\n    <li>feed cat</li>\n    <li>feed me</li>\n  </fragment>}\n/>\n'
            )
          )
        );
      }
      p.isMDXComponent = !0;
    },
    143: function(e, n, t) {
      "use strict";
      t.d(n, "a", function() {
        return b;
      }),
        t.d(n, "b", function() {
          return u;
        });
      var o = t(0),
        a = t.n(o);
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
          var o = Object.getOwnPropertySymbols(e);
          n &&
            (o = o.filter(function(n) {
              return Object.getOwnPropertyDescriptor(e, n).enumerable;
            })),
            t.push.apply(t, o);
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
          o,
          a = (function(e, n) {
            if (null == e) return {};
            var t,
              o,
              a = {},
              l = Object.keys(e);
            for (o = 0; o < l.length; o++)
              (t = l[o]), n.indexOf(t) >= 0 || (a[t] = e[t]);
            return a;
          })(e, n);
        if (Object.getOwnPropertySymbols) {
          var l = Object.getOwnPropertySymbols(e);
          for (o = 0; o < l.length; o++)
            (t = l[o]),
              n.indexOf(t) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(e, t) &&
                  (a[t] = e[t]));
        }
        return a;
      }
      var i = a.a.createContext({}),
        p = function(e) {
          var n = a.a.useContext(i),
            t = n;
          return e && (t = "function" == typeof e ? e(n) : s(s({}, n), e)), t;
        },
        b = function(e) {
          var n = p(e.components);
          return a.a.createElement(i.Provider, { value: n }, e.children);
        },
        m = {
          inlineCode: "code",
          wrapper: function(e) {
            var n = e.children;
            return a.a.createElement(a.a.Fragment, {}, n);
          }
        },
        d = a.a.forwardRef(function(e, n) {
          var t = e.components,
            o = e.mdxType,
            l = e.originalType,
            r = e.parentName,
            i = c(e, ["components", "mdxType", "originalType", "parentName"]),
            b = p(t),
            d = o,
            u = b["".concat(r, ".").concat(d)] || b[d] || m[d] || l;
          return t
            ? a.a.createElement(u, s(s({ ref: n }, i), {}, { components: t }))
            : a.a.createElement(u, s({ ref: n }, i));
        });
      function u(e, n) {
        var t = arguments,
          o = n && n.mdxType;
        if ("string" == typeof e || o) {
          var l = t.length,
            r = new Array(l);
          r[0] = d;
          var s = {};
          for (var c in n) hasOwnProperty.call(n, c) && (s[c] = n[c]);
          (s.originalType = e),
            (s.mdxType = "string" == typeof e ? e : o),
            (r[1] = s);
          for (var i = 2; i < l; i++) r[i] = t[i];
          return a.a.createElement.apply(null, r);
        }
        return a.a.createElement.apply(null, t);
      }
      d.displayName = "MDXCreateElement";
    }
  }
]);
