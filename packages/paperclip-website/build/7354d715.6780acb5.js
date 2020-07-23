(window.webpackJsonp = window.webpackJsonp || []).push([
  [20],
  {
    122: function(e, t, n) {
      "use strict";
      n.r(t),
        n.d(t, "frontMatter", function() {
          return i;
        }),
        n.d(t, "metadata", function() {
          return o;
        }),
        n.d(t, "rightToc", function() {
          return l;
        }),
        n.d(t, "default", function() {
          return p;
        });
      var r = n(2),
        a = n(6),
        c = (n(0), n(143)),
        i = {
          id: "usage-react",
          title: "Using Paperclip in React apps",
          sidebar_label: "React usage"
        },
        o = {
          id: "usage-react",
          isDocsHomePage: !1,
          title: "Using Paperclip in React apps",
          description: "Installation",
          source: "@site/docs/usage-react.md",
          permalink: "/docs/usage-react",
          editUrl:
            "https://github.com/crcn/paperclip/packages/edit/master/website/docs/usage-react.md",
          sidebar_label: "React usage",
          sidebar: "docs",
          previous: {
            title: "Installing the VS Code extension",
            permalink: "/docs/getting-started-vscode"
          },
          next: { title: "Paperclip Syntax", permalink: "/docs/usage-syntax" }
        },
        l = [
          { value: "Installation", id: "installation", children: [] },
          {
            value: "Using Paperclip UIs in React code",
            id: "using-paperclip-uis-in-react-code",
            children: []
          },
          {
            value: "Accessing Paperclip class names",
            id: "accessing-paperclip-class-names",
            children: []
          },
          {
            value: "How to add styles to Paperclip UIs",
            id: "how-to-add-styles-to-paperclip-uis",
            children: []
          },
          {
            value: "Generating typed definition files",
            id: "generating-typed-definition-files",
            children: []
          }
        ],
        s = { rightToc: l };
      function p(e) {
        var t = e.components,
          n = Object(a.a)(e, ["components"]);
        return Object(c.b)(
          "wrapper",
          Object(r.a)({}, s, n, { components: t, mdxType: "MDXLayout" }),
          Object(c.b)("h2", { id: "installation" }, "Installation"),
          Object(c.b)(
            "blockquote",
            null,
            Object(c.b)(
              "p",
              { parentName: "blockquote" },
              "You can skip this step if you set up a new Paperclip project using the ",
              Object(c.b)(
                "a",
                Object(r.a)({ parentName: "p" }, { href: "/docs/usage-cli" }),
                "CLI tool"
              ),
              "."
            )
          ),
          Object(c.b)(
            "p",
            null,
            "To use Paperclip in React, you'll need to install the compiler first:"
          ),
          Object(c.b)(
            "pre",
            null,
            Object(c.b)(
              "code",
              Object(r.a)({ parentName: "pre" }, { className: "language-sh" }),
              "npm install paperclip-compiler-react --save-dev\n"
            )
          ),
          Object(c.b)(
            "p",
            null,
            "Then in your ",
            Object(c.b)(
              "inlineCode",
              { parentName: "p" },
              "paperclip.config.json"
            ),
            " file, change ",
            Object(c.b)(
              "inlineCode",
              { parentName: "p" },
              "compilerOptions.name"
            ),
            " to look like:"
          ),
          Object(c.b)(
            "pre",
            null,
            Object(c.b)(
              "code",
              Object(r.a)(
                { parentName: "pre" },
                { className: "language-json" }
              ),
              '{\n  "compilerOptions": {\n    "name": "paperclip-compiler-react"\n  },\n  "sourceDirectory": "./src"\n}\n'
            )
          ),
          Object(c.b)("p", null, "After that, you're good to go!"),
          Object(c.b)(
            "h2",
            { id: "using-paperclip-uis-in-react-code" },
            "Using Paperclip UIs in React code"
          ),
          Object(c.b)(
            "p",
            null,
            "Assuming that you've installed the React compiler & have set up Webpack to use Paperclip, you can just import ",
            Object(c.b)("inlineCode", { parentName: "p" }, "*.pc"),
            " directly into your React code:"
          ),
          Object(c.b)(
            "pre",
            null,
            Object(c.b)(
              "code",
              Object(r.a)({ parentName: "pre" }, { className: "language-tsx" }),
              'import * as ui from "./counter.pc";\nimport React, { useState } from "react";\n\nexport default () => {\n  const [currentCount, setCount] = useState(0);\n  const onClick = () => setCount(currentCount + 1);\n  return <ui.Container onClick={onClick}>\n    <ui.CurentCount>{currentCount}</ui.CurrentCount>\n  </ui.Container>;\n};\n'
            )
          ),
          Object(c.b)(
            "p",
            null,
            "\u261d\ud83c\udffb This example uses the following Paperclip UI file:"
          ),
          Object(c.b)(
            "pre",
            null,
            Object(c.b)(
              "code",
              Object(r.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '<style>\n   .Container {\n     font-family: Helvetica;\n     cursor: pointer;\n   }\n   .CurrentCount {\n     font-weight: 400;\n   }\n</style>\n\n\x3c!-- Components --\x3e\n\n<div export component as="Container" className="Container">\n  Current count: {children}\n</div>\n<div export component as="CurrentCount" className="CurrentCount">\n  {children}\n</div>\n\n\x3c!-- Previews --\x3e\n\n<Container>\n  <CurrentCount>\n    50\n  </CurrentCount>\n</Container>\n'
            )
          ),
          Object(c.b)(
            "h2",
            { id: "accessing-paperclip-class-names" },
            "Accessing Paperclip class names"
          ),
          Object(c.b)(
            "p",
            null,
            "The compiler exports as ",
            Object(c.b)("inlineCode", { parentName: "p" }, "classNames"),
            " property that you can use to stylize elements outside of the UI file. For example:"
          ),
          Object(c.b)(
            "pre",
            null,
            Object(c.b)(
              "code",
              Object(r.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              "<style>\n  .my-style {\n    color: red\n  }\n</style>\n"
            )
          ),
          Object(c.b)("p", null, "In React, you can do this:"),
          Object(c.b)(
            "pre",
            null,
            Object(c.b)(
              "code",
              Object(r.a)({ parentName: "pre" }, { className: "language-jsx" }),
              "import {classNames} from \"./template.pc\";\n\nexport default () => {\n  return <div className={classNames['my-style']}>\n    This is red text\n  </div>;\n};\n"
            )
          ),
          Object(c.b)(
            "h2",
            { id: "how-to-add-styles-to-paperclip-uis" },
            "How to add styles to Paperclip UIs"
          ),
          Object(c.b)(
            "p",
            null,
            "There will be some cases where you might want to add more behavior around styling than what Paperclip can do. For that you can just use inline styles. Here's an example:"
          ),
          Object(c.b)(
            "pre",
            null,
            Object(c.b)(
              "code",
              Object(r.a)(
                { parentName: "pre" },
                { className: "language-html", metastring: "live", live: !0 }
              ),
              '<style>\n  .progress {\n    background: linear-gradient(to right, #F60, #00CC00);\n    border-radius: 99px;\n    height: 3px;\n    margin: 4px;\n  }\n</style>\n\n\x3c!-- {style} must be explicity defined for it to be assignable to this element --\x3e\n<div export component as="Progress" class="progress" {style?}>\n</div>\n\n\x3c!-- previews --\x3e\n\n<Progress style="width: 50%" />\n<Progress style="width: 80%" />\n<Progress style="width: 100%" />\n'
            )
          ),
          Object(c.b)("p", null, "Then in JavaScript:"),
          Object(c.b)(
            "pre",
            null,
            Object(c.b)(
              "code",
              Object(r.a)(
                { parentName: "pre" },
                { className: "language-typescript" }
              ),
              'import {Progress} from "./progress.pc";\n\n<Progress style={{ width: `${progress}%` }} />\n'
            )
          ),
          Object(c.b)(
            "h2",
            { id: "generating-typed-definition-files" },
            "Generating typed definition files"
          ),
          Object(c.b)(
            "p",
            null,
            "If you're using TypeScript, you can generate typed definition files using the Paperclip CLI tool. If you don't already have it installed, go ahead and run:"
          ),
          Object(c.b)(
            "pre",
            null,
            Object(c.b)(
              "code",
              Object(r.a)({ parentName: "pre" }, { className: "language-sh" }),
              "npm install paperclip-cli --save-dev\n"
            )
          ),
          Object(c.b)("p", null, "Then after that, run:"),
          Object(c.b)(
            "pre",
            null,
            Object(c.b)(
              "code",
              Object(r.a)({ parentName: "pre" }, { className: "language-sh" }),
              "npx paperclip build --definition --write\n"
            )
          ),
          Object(c.b)(
            "p",
            null,
            "\u261d\ud83c\udffb this will generate typed definition files that you can use in your react components."
          ),
          Object(c.b)(
            "blockquote",
            null,
            Object(c.b)(
              "p",
              { parentName: "blockquote" },
              "\u2728 I recommend that you include ",
              Object(c.b)("inlineCode", { parentName: "p" }, "*.pc.d.ts"),
              " in your ",
              Object(c.b)("inlineCode", { parentName: "p" }, ".gitignore"),
              "."
            )
          ),
          Object(c.b)("p", null, "To watch for changes, you can do this:"),
          Object(c.b)(
            "pre",
            null,
            Object(c.b)(
              "code",
              Object(r.a)({ parentName: "pre" }, {}),
              "npx paperclip build --definition --write --watch\n"
            )
          ),
          Object(c.b)(
            "blockquote",
            null,
            Object(c.b)(
              "p",
              { parentName: "blockquote" },
              "Check out the ",
              Object(c.b)(
                "a",
                Object(r.a)({ parentName: "p" }, { href: "/docs/usage-cli" }),
                "CLI docs"
              ),
              " for more info"
            )
          )
        );
      }
      p.isMDXComponent = !0;
    },
    143: function(e, t, n) {
      "use strict";
      n.d(t, "a", function() {
        return u;
      }),
        n.d(t, "b", function() {
          return m;
        });
      var r = n(0),
        a = n.n(r);
      function c(e, t, n) {
        return (
          t in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
              })
            : (e[t] = n),
          e
        );
      }
      function i(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var r = Object.getOwnPropertySymbols(e);
          t &&
            (r = r.filter(function(t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable;
            })),
            n.push.apply(n, r);
        }
        return n;
      }
      function o(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {};
          t % 2
            ? i(Object(n), !0).forEach(function(t) {
                c(e, t, n[t]);
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
            : i(Object(n)).forEach(function(t) {
                Object.defineProperty(
                  e,
                  t,
                  Object.getOwnPropertyDescriptor(n, t)
                );
              });
        }
        return e;
      }
      function l(e, t) {
        if (null == e) return {};
        var n,
          r,
          a = (function(e, t) {
            if (null == e) return {};
            var n,
              r,
              a = {},
              c = Object.keys(e);
            for (r = 0; r < c.length; r++)
              (n = c[r]), t.indexOf(n) >= 0 || (a[n] = e[n]);
            return a;
          })(e, t);
        if (Object.getOwnPropertySymbols) {
          var c = Object.getOwnPropertySymbols(e);
          for (r = 0; r < c.length; r++)
            (n = c[r]),
              t.indexOf(n) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(e, n) &&
                  (a[n] = e[n]));
        }
        return a;
      }
      var s = a.a.createContext({}),
        p = function(e) {
          var t = a.a.useContext(s),
            n = t;
          return e && (n = "function" == typeof e ? e(t) : o(o({}, t), e)), n;
        },
        u = function(e) {
          var t = p(e.components);
          return a.a.createElement(s.Provider, { value: t }, e.children);
        },
        b = {
          inlineCode: "code",
          wrapper: function(e) {
            var t = e.children;
            return a.a.createElement(a.a.Fragment, {}, t);
          }
        },
        d = a.a.forwardRef(function(e, t) {
          var n = e.components,
            r = e.mdxType,
            c = e.originalType,
            i = e.parentName,
            s = l(e, ["components", "mdxType", "originalType", "parentName"]),
            u = p(n),
            d = r,
            m = u["".concat(i, ".").concat(d)] || u[d] || b[d] || c;
          return n
            ? a.a.createElement(m, o(o({ ref: t }, s), {}, { components: n }))
            : a.a.createElement(m, o({ ref: t }, s));
        });
      function m(e, t) {
        var n = arguments,
          r = t && t.mdxType;
        if ("string" == typeof e || r) {
          var c = n.length,
            i = new Array(c);
          i[0] = d;
          var o = {};
          for (var l in t) hasOwnProperty.call(t, l) && (o[l] = t[l]);
          (o.originalType = e),
            (o.mdxType = "string" == typeof e ? e : r),
            (i[1] = o);
          for (var s = 2; s < c; s++) i[s] = n[s];
          return a.a.createElement.apply(null, i);
        }
        return a.a.createElement.apply(null, n);
      }
      d.displayName = "MDXCreateElement";
    }
  }
]);
