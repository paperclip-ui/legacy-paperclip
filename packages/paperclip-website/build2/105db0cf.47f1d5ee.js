(window.webpackJsonp = window.webpackJsonp || []).push([
  [7],
  {
    154: function(e, n, t) {
      "use strict";
      t.r(n),
        t.d(n, "frontMatter", function() {
          return o;
        }),
        t.d(n, "metadata", function() {
          return p;
        }),
        t.d(n, "rightToc", function() {
          return i;
        }),
        t.d(n, "default", function() {
          return s;
        });
      var r = t(2),
        a = t(9),
        c = (t(0), t(204)),
        o = {
          id: "configuring-webpack",
          title: "Setting up Webpack",
          sidebar_label: "Webpack setup"
        },
        p = {
          id: "configuring-webpack",
          isDocsHomePage: !1,
          title: "Setting up Webpack",
          description:
            "You can use Paperclip with Webpack by installing the loader:",
          source: "@site/docs/configuring-webpack.md",
          permalink: "/docs/configuring-webpack",
          editUrl:
            "https://github.com/crcn/paperclip/packages/edit/master/website/docs/configuring-webpack.md",
          sidebar_label: "Webpack setup",
          sidebar: "docs",
          previous: {
            title: "Configuring Paperclip",
            permalink: "/docs/configuring-paperclip"
          },
          next: {
            title: "Troubleshooting",
            permalink: "/docs/usage-troubleshooting"
          }
        },
        i = [],
        l = { rightToc: i };
      function s(e) {
        var n = e.components,
          t = Object(a.a)(e, ["components"]);
        return Object(c.b)(
          "wrapper",
          Object(r.a)({}, l, t, { components: n, mdxType: "MDXLayout" }),
          Object(c.b)(
            "p",
            null,
            "You can use Paperclip with ",
            Object(c.b)(
              "a",
              Object(r.a)(
                { parentName: "p" },
                { href: "https://webpack.js.org/" }
              ),
              "Webpack"
            ),
            " by installing the loader:"
          ),
          Object(c.b)(
            "pre",
            null,
            Object(c.b)(
              "code",
              Object(r.a)({ parentName: "pre" }, { className: "language-sh" }),
              "npm install paperclip-loader --save-dev\n"
            )
          ),
          Object(c.b)(
            "p",
            null,
            "Also, be sure that you also have the following dependencies installed:"
          ),
          Object(c.b)(
            "pre",
            null,
            Object(c.b)(
              "code",
              Object(r.a)({ parentName: "pre" }, { className: "language-sh" }),
              "npm install style-loader css-loader file-loader --save-dev\n"
            )
          ),
          Object(c.b)(
            "blockquote",
            null,
            Object(c.b)(
              "p",
              { parentName: "blockquote" },
              "The reason for this is that Paperclip emits CSS files that need to be loaded."
            )
          ),
          Object(c.b)(
            "p",
            null,
            "After that, you can set can include ",
            Object(c.b)("inlineCode", { parentName: "p" }, "paperclip-loader"),
            " in your webpack config rules:"
          ),
          Object(c.b)(
            "pre",
            null,
            Object(c.b)(
              "code",
              Object(r.a)(
                { parentName: "pre" },
                { className: "language-javascript" }
              ),
              '{\n  test: /\\.pc$/,\n  loader: "paperclip-loader",\n  options: {\n    \n    // paperclip.config.json can be generated via the paperclip-cli tool\n    config: require("./paperclip.config.json")\n  }\n}\n'
            )
          ),
          Object(c.b)(
            "blockquote",
            null,
            Object(c.b)(
              "p",
              { parentName: "blockquote" },
              "\u261d\ud83c\udffbbe sure that you have a ",
              Object(c.b)(
                "a",
                Object(r.a)(
                  { parentName: "p" },
                  { href: "/docs/configuring-paperclip" }
                ),
                "paperclip.config.json"
              ),
              " file."
            )
          ),
          Object(c.b)(
            "p",
            null,
            "For context, here's what your entire Webpack config might look like:"
          ),
          Object(c.b)(
            "pre",
            null,
            Object(c.b)(
              "code",
              Object(r.a)(
                { parentName: "pre" },
                { className: "language-javascript" }
              ),
              'const path = require("path");\nconst webpack = require("webpack");\n\nmodule.exports = {\n  entry: "./src/index.js",\n  output: {\n    filename: "[name].js",\n    path: path.resolve(__dirname, "dist")\n  },\n  module: {\n    rules: [\n      {\n        test: /\\.pc$/,\n        loader: "paperclip-loader",\n        options: {\n          \n          // paperclip.config.json can be generated via the paperclip-cli tool\n          config: require("./paperclip.config.json")\n        }\n      },\n\n      // Required since paperclip-loader emits\n      // CSS files\n      {\n        test: /\\.css$/,\n        use: ["style-loader", "css-loader"]\n      },\n      {\n        test: /\\.(png|jpe?g|gif)$/i,\n        use: ["file-loader"]\n      }\n    ]\n  },\n\n  resolve: {\n    extensions: [".tsx", ".ts", ".js"]\n  }\n};\n'
            )
          ),
          Object(c.b)(
            "p",
            null,
            "That's it! from there you can start using Paperclip in your UIs. For example:"
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
              '<div export component as="Greeter">\n  Hello {children}!\n</div>\n'
            )
          ),
          Object(c.b)("p", null, "Then, in React code:"),
          Object(c.b)(
            "pre",
            null,
            Object(c.b)(
              "code",
              Object(r.a)(
                { parentName: "pre" },
                { className: "language-javascript" }
              ),
              'import * as ui from "./greater.pc";\nimport React from "react";\nimport ReactDOM from "react-dom";\n\nReactDOM.render(<ui.Greeter>\n  Paperclip\n</ui.Greeter>, document.getElementById("mount"));\n'
            )
          ),
          Object(c.b)(
            "p",
            null,
            "\u261d\ud83c\udffb This should render: ",
            Object(c.b)("inlineCode", { parentName: "p" }, "Hello Paperclip!"),
            "."
          )
        );
      }
      s.isMDXComponent = !0;
    },
    204: function(e, n, t) {
      "use strict";
      t.d(n, "a", function() {
        return u;
      }),
        t.d(n, "b", function() {
          return f;
        });
      var r = t(0),
        a = t.n(r);
      function c(e, n, t) {
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
      function o(e, n) {
        var t = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var r = Object.getOwnPropertySymbols(e);
          n &&
            (r = r.filter(function(n) {
              return Object.getOwnPropertyDescriptor(e, n).enumerable;
            })),
            t.push.apply(t, r);
        }
        return t;
      }
      function p(e) {
        for (var n = 1; n < arguments.length; n++) {
          var t = null != arguments[n] ? arguments[n] : {};
          n % 2
            ? o(Object(t), !0).forEach(function(n) {
                c(e, n, t[n]);
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : o(Object(t)).forEach(function(n) {
                Object.defineProperty(
                  e,
                  n,
                  Object.getOwnPropertyDescriptor(t, n)
                );
              });
        }
        return e;
      }
      function i(e, n) {
        if (null == e) return {};
        var t,
          r,
          a = (function(e, n) {
            if (null == e) return {};
            var t,
              r,
              a = {},
              c = Object.keys(e);
            for (r = 0; r < c.length; r++)
              (t = c[r]), n.indexOf(t) >= 0 || (a[t] = e[t]);
            return a;
          })(e, n);
        if (Object.getOwnPropertySymbols) {
          var c = Object.getOwnPropertySymbols(e);
          for (r = 0; r < c.length; r++)
            (t = c[r]),
              n.indexOf(t) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(e, t) &&
                  (a[t] = e[t]));
        }
        return a;
      }
      var l = a.a.createContext({}),
        s = function(e) {
          var n = a.a.useContext(l),
            t = n;
          return e && (t = "function" == typeof e ? e(n) : p(p({}, n), e)), t;
        },
        u = function(e) {
          var n = s(e.components);
          return a.a.createElement(l.Provider, { value: n }, e.children);
        },
        b = {
          inlineCode: "code",
          wrapper: function(e) {
            var n = e.children;
            return a.a.createElement(a.a.Fragment, {}, n);
          }
        },
        d = a.a.forwardRef(function(e, n) {
          var t = e.components,
            r = e.mdxType,
            c = e.originalType,
            o = e.parentName,
            l = i(e, ["components", "mdxType", "originalType", "parentName"]),
            u = s(t),
            d = r,
            f = u["".concat(o, ".").concat(d)] || u[d] || b[d] || c;
          return t
            ? a.a.createElement(f, p(p({ ref: n }, l), {}, { components: t }))
            : a.a.createElement(f, p({ ref: n }, l));
        });
      function f(e, n) {
        var t = arguments,
          r = n && n.mdxType;
        if ("string" == typeof e || r) {
          var c = t.length,
            o = new Array(c);
          o[0] = d;
          var p = {};
          for (var i in n) hasOwnProperty.call(n, i) && (p[i] = n[i]);
          (p.originalType = e),
            (p.mdxType = "string" == typeof e ? e : r),
            (o[1] = p);
          for (var l = 2; l < c; l++) o[l] = t[l];
          return a.a.createElement.apply(null, o);
        }
        return a.a.createElement.apply(null, t);
      }
      d.displayName = "MDXCreateElement";
    }
  }
]);
